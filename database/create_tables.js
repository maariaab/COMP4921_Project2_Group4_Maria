const { mysqlPool: database } = include('databaseConnection');

async function createTables() {

    const createUsersSQL = `
        CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(25) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL
        );
    `;

    const createTemplatesSQL = `
        CREATE TABLE IF NOT EXISTS templates (
            template_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            template_name VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );

    `;
    const createTemplateVersionsSQL = `
        CREATE TABLE IF NOT EXISTS template_versions (
            version_id INT AUTO_INCREMENT PRIMARY KEY,
            template_id INT NOT NULL,
            version_number INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            UNIQUE (template_id, version_number),
            UNIQUE (template_id, version_id),

            FOREIGN KEY (template_id)
                REFERENCES templates(template_id)
                ON DELETE CASCADE
        );

    `;
    const createTemplateFieldsSQL = `
        CREATE TABLE IF NOT EXISTS template_fields (
            field_id INT AUTO_INCREMENT PRIMARY KEY,
            version_id INT NOT NULL,
            field_name VARCHAR(100) NOT NULL,
            field_type VARCHAR(30) NOT NULL,
            is_required BOOLEAN NOT NULL DEFAULT FALSE,
            validation_rules JSON,
            field_order INT NOT NULL DEFAULT 0,

            UNIQUE (version_id, field_name),

            FOREIGN KEY (version_id)
                REFERENCES template_versions(version_id)
                ON DELETE CASCADE
        );

    `;
    const createListsSQL = `
        CREATE TABLE IF NOT EXISTS lists (
            list_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            template_id INT NOT NULL,
            list_name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            UNIQUE (list_id, template_id),

            FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE CASCADE,

            FOREIGN KEY (template_id)
                REFERENCES templates(template_id)
                ON DELETE CASCADE
        );

    `;

    const createEntriesSQL = `
        CREATE TABLE IF NOT EXISTS entries (
            entry_id INT AUTO_INCREMENT PRIMARY KEY,
            list_id INT NOT NULL,
            template_id INT NOT NULL,
            version_id INT NOT NULL,
            entry_data JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (list_id, template_id)
                REFERENCES lists(list_id, template_id)
                ON DELETE CASCADE,

            FOREIGN KEY (template_id, version_id)
                REFERENCES template_versions(template_id, version_id)
        );
    `;

    try {

        await database.query(createUsersSQL);
        await database.query(createTemplatesSQL);
        await database.query(createTemplateVersionsSQL);
        await database.query(createTemplateFieldsSQL);
        await database.query(createListsSQL);
        console.log("Successfully created all tables");
        return true;
    }
    catch (err) {
        console.log("Error creating tables");
        console.log(err);

        return false;
    }
}

module.exports = { createTables };