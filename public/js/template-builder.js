
const form = document.getElementById("template-form");
const fieldsContainer = document.getElementById("fields-container");
const addFieldButton = document.getElementById("add-field");
const saveButton = document.getElementById("save-template");
const errorBox = document.getElementById("form-error");

let fieldCounter = 0;

function addField() {
    fieldCounter++;

    const field = document.createElement("div");
    field.className = "box template-field";

    field.innerHTML = `
        <div class="is-flex is-justify-content-space-between
                    is-align-items-center mb-4">
            <h3 class="title is-5">Field ${fieldCounter}</h3>

            <button type="button"
                    class="button is-danger is-light delete-field">
                Delete Field
            </button>
        </div>

        <div class="field">
            <label class="label">Field Name</label>
            <input class="input field-name"
                   type="text"
                   maxlength="100"
                   placeholder="e.g. appointment_date"
                   required>
        </div>

        <div class="field">
            <label class="label">Field Type</label>
            <div class="select is-fullwidth">
                <select class="field-type">
                    <option value="boolean">Boolean (Checkbox)</option>
                    <option value="text" selected>
                        Single-line Text
                    </option>
                    <option value="textarea">Multi-line Text</option>
                    <option value="select">Dropdown</option>
                    <option value="date">Date Picker</option>
                </select>
            </div>
        </div>

        <div class="field options-container is-hidden">
            <label class="label">Dropdown Options</label>
            <input class="input field-options"
                   type="text"
                   placeholder="yes, no, maybe">
            <p class="help">Separate options with commas.</p>
        </div>

        <div class="field">
            <label class="checkbox">
                <input type="checkbox" class="field-required">
                Required Field
            </label>
        </div>
    `;

    const typeSelect = field.querySelector(".field-type");
    const optionsContainer =
        field.querySelector(".options-container");
    const optionsInput = field.querySelector(".field-options");

    typeSelect.addEventListener("change", () => {
        const isDropdown = typeSelect.value === "select";

        optionsContainer.classList.toggle(
            "is-hidden",
            !isDropdown
        );

        optionsInput.required = isDropdown;
    });

    field.querySelector(".delete-field")
        .addEventListener("click", () => {
            field.remove();
        });

    fieldsContainer.appendChild(field);
}

addFieldButton.addEventListener("click", addField);

// Start with one field
addField();

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorBox.classList.add("is-hidden");

    const templateName =
        document.getElementById("template-name").value.trim();

    const description =
        document.getElementById("template-description").value.trim();

    const fields = [];

    for (const fieldElement of
        fieldsContainer.querySelectorAll(".template-field")) {

        const fieldName =
            fieldElement.querySelector(".field-name").value.trim();

        const fieldType =
            fieldElement.querySelector(".field-type").value;

        const isRequired =
            fieldElement.querySelector(".field-required").checked;

        const validationRules = {};

        if (fieldType === "select") {
            const rawOptions =
                fieldElement.querySelector(".field-options").value;

            validationRules.allowedValues = rawOptions
                .split(",")
                .map(option => option.trim())
                .filter(Boolean);

            if (validationRules.allowedValues.length === 0) {
                showError("Dropdown fields need at least one option.");
                return;
            }
        }

        fields.push({
            field_name: fieldName,
            field_type: fieldType,
            is_required: isRequired,
            validation_rules: validationRules
        });
    }

    if (fields.length === 0) {
        showError("Add at least one field.");
        return;
    }

    const names = fields.map(f => f.field_name);

    if (new Set(names).size !== names.length) {
        showError("Field names must be unique.");
        return;
    }

    const templateData = {
        template_name: templateName,
        description,
        fields
    };

    saveButton.disabled = true;
    saveButton.classList.add("is-loading");

    try {
        const response = await fetch("/templates/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(templateData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "Failed to save template."
            );
        }

        window.location.href = "/templates/my-templates";

    } catch (error) {
        showError(error.message);
    } finally {
        saveButton.disabled = false;
        saveButton.classList.remove("is-loading");
    }
});

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("is-hidden");
    errorBox.scrollIntoView({ behavior: "smooth" });
}
