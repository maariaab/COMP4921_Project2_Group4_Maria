
const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middleware/auth");

const {
    getAvailableTemplates,
    createList,
    getUserLists
} = require("../database/lists");

// Display list creation page
router.get("/create", requireLogin, async (req, res) => {

    try {
        const userId = req.session.userId;

        const templates = await getAvailableTemplates(userId);

        res.render("lists/create", {
            templates,
            selectedTemplateId: req.query.template_id || "",
            error: null
        });

    } catch (error) {
        console.error("Error loading list creation:", error);

        res.status(500).send(
            "Unable to load the list creation page."
        );
    }
});

// Save a new list
router.post("/create", requireLogin, async (req, res) => {

    try {
        const userId = req.session.userId;
        const { list_name, template_id } = req.body;

        if (
            typeof list_name !== "string" ||
            !list_name.trim() ||
            list_name.length > 100
        ) {
            return res.status(400).send(
                "Please provide a valid list name."
            );
        }

        const templateId = Number(template_id);

        if (
            !Number.isSafeInteger(templateId) ||
            templateId <= 0
        ) {
            return res.status(400).send(
                "Invalid template selection."
            );
        }

        const listId = await createList(
            userId,
            templateId,
            list_name.trim()
        );

        if (!listId) {
            return res.status(403).send(
                "Template not found or access denied."
            );
        }

        // Redirect to user's lists
        return res.redirect("/lists/my-lists");

    } catch (error) {
        console.error("Error creating list:", error);

        return res.status(500).send(
            "Unable to create list."
        );
    }
});

// Display user's lists
router.get("/my-lists", requireLogin, async (req, res) => {

    try {
        const userId = req.session.userId;

        const lists = await getUserLists(userId);

        res.render("lists/my-lists", { lists });

    } catch (error) {
        console.error("Error loading lists:", error);

        res.status(500).send(
            "Unable to load your lists."
        );
    }
});

module.exports = router;
