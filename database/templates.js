
const { mysqlPool: database } =
    require("../databaseConnection");

async function createTemplate(userId, templateData) {

    const connection = await database.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Create template
        const [templateResult] = await connection.execute(
            `INSERT INTO templates
             (user_id, template_name, description)
             VALUES (?, ?, ?)`,
            [
                userId,
                templateData.template_name,
                templateData.description
            ]
        );

        const templateId = templateResult.insertId;

        // 2. Create initial template version
        const [versionResult] = await connection.execute(
            `INSERT INTO template_versions
             (template_id, version_number)
             VALUES (?, ?)`,
            [templateId, 1]
        );

        const versionId = versionResult.insertId;

        // 3. Insert all fields
        for (const [index, field] of
            templateData.fields.entries()) {

            await connection.execute(
                `INSERT INTO template_fields
                 (version_id, field_name, field_type,
                  is_required, validation_rules, field_order)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    versionId,
                    field.field_name,
                    field.field_type,
                    field.is_required ? 1 : 0,
                    JSON.stringify(field.validation_rules),
                    index
                ]
            );
        }

        // Save everything together
        await connection.commit();

        return templateId;

    } catch (error) {

        await connection.rollback();
        console.error("Error creating template:", error);
        throw error;

    } finally {
        connection.release();
    }
}

async function getUserTemplates(userId) {

    const sql = `
        SELECT
            template_id,
            template_name,
            description,
            created_at
        FROM templates
        WHERE user_id = ?
        ORDER BY created_at DESC, template_id DESC
    `;

    try {
        const [rows] = await database.execute(sql, [userId]);

        return rows;

    } catch (error) {
        console.error("Error retrieving user templates:", error);
        throw error;
    }
}

async function getTemplateById(templateId) {

    const [rows] = await database.execute(
        `SELECT
            t.template_id,
            t.user_id,
            t.template_name,
            t.description,
            t.created_at,
            tv.version_id,
            tv.version_number
         FROM templates t
         LEFT JOIN template_versions tv
             ON tv.version_id = (
                 SELECT v.version_id
                 FROM template_versions v
                 WHERE v.template_id = t.template_id
                 ORDER BY v.version_number DESC
                 LIMIT 1
             )
         WHERE t.template_id = ?`,
        [templateId]
    );

    return rows[0] || null;
}


module.exports = { createTemplate, getUserTemplates };
