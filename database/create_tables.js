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


    try {

        await database.query(createUsersSQL);
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