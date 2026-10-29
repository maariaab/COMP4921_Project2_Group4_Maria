
const { mysqlPool: database } =
    require("../databaseConnection");

// Retrieve templates owned by the user
async function getAvailableTemplates(userId) {

    const sql = `
        SELECT
            t.template_id,
            t.template_name
        FROM templates t
        WHERE t.user_id = ?
          AND EXISTS (
              SELECT 1
              FROM template_versions tv
              WHERE tv.template_id = t.template_id
          )
        ORDER BY t.template_name ASC
    `;

    const [rows] = await database.execute(sql, [userId]);

    return rows;
}

// Create a list from an existing template
async function createList(userId, templateId, listName) {

    const sql = `
        INSERT INTO lists
            (user_id, template_id, list_name)
        SELECT
            t.user_id, t.template_id, ?
        FROM templates t
        WHERE t.template_id = ?
          AND t.user_id = ?
          AND EXISTS (
              SELECT 1
              FROM template_versions tv
              WHERE tv.template_id = t.template_id
          )
    `;

    const [result] = await database.execute(sql, [
        listName,
        templateId,
        userId
    ]);

    if (result.affectedRows !== 1) {
        return null;
    }

    return result.insertId;
}

// Retrieve lists belonging to a user
async function getUserLists(userId) {

    const sql = `
        SELECT
            l.list_id,
            l.list_name,
            l.created_at,
            t.template_id,
            t.template_name
        FROM lists l
        JOIN templates t
            ON l.template_id = t.template_id
        WHERE l.user_id = ?
        ORDER BY l.created_at DESC, l.list_id DESC
    `;

    const [rows] = await database.execute(sql, [userId]);

    return rows;
}

module.exports = {
    getAvailableTemplates,
    createList,
    getUserLists
};
