
const express = require("express");
const router = express.Router();

const { requireLogin } = require("../middleware/auth");
const { createTemplate, getUserTemplates } = require("../database/templates");
const { validateTemplate } =
    require("../utils/validateTemplate");

// Public: View templates
router.get("/", async (req, res) => {
    res.render("templates/index");
});

// Protected: Template creation page
router.get("/create", requireLogin, (req, res) => {
    res.render("templates/create");
});

// Protected: Save new template
router.post("/create", requireLogin, async (req, res) => {

    try {
        const validationError = validateTemplate(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                error: validationError
            });
        }

        // Match this property to your login session.
        const userId = req.session.userId;

        const templateId = await createTemplate(
            userId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Template created successfully.",
            templateId
        });

    } catch (error) {
        console.error("Template creation failed:", error);

        return res.status(500).json({
            success: false,
            error: "Unable to create template."
        });
    }
});

// Display templates owned by the logged-in user
router.get("/my-templates", requireLogin, async (req, res) => {

    try {
        const userId = req.session.userId;

        const templates = await getUserTemplates(userId);

        res.render("templates/my-templates", {
            templates
        });

    } catch (error) {
        console.error("Error loading user templates:", error);

        res.status(500).send(
            "An error occurred while loading your templates."
        );
    }
});

module.exports = router;
