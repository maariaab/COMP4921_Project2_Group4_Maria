
const allowedTypes = new Set([
    "boolean",
    "text",
    "textarea",
    "select",
    "date"
]);

function validateTemplate(data) {

    if (!data || typeof data !== "object") {
        return "Invalid template data.";
    }

    if (
        typeof data.template_name !== "string" ||
        !data.template_name.trim() ||
        data.template_name.length > 100
    ) {
        return "Template name must be 1-100 characters.";
    }

    if (
        typeof data.description !== "string" ||
        data.description.length > 5000
    ) {
        return "Invalid template description.";
    }

    if (
        !Array.isArray(data.fields) ||
        data.fields.length === 0 ||
        data.fields.length > 100
    ) {
        return "A template must have 1-100 fields.";
    }

    const names = new Set();

    for (const field of data.fields) {

        if (!field || typeof field !== "object") {
            return "Invalid field definition.";
        }

        if (
            typeof field.field_name !== "string" ||
            !/^[a-zA-Z][a-zA-Z0-9_]{0,99}$/
                .test(field.field_name)
        ) {
            return "Field names must start with a letter and contain only letters, numbers, or underscores.";
        }

        if (names.has(field.field_name)) {
            return "Field names must be unique.";
        }

        names.add(field.field_name);

        if (!allowedTypes.has(field.field_type)) {
            return "Unsupported field type.";
        }

        if (typeof field.is_required !== "boolean") {
            return "Required must be true or false.";
        }

        const rules = field.validation_rules;

        if (
            !rules ||
            typeof rules !== "object" ||
            Array.isArray(rules)
        ) {
            return "Invalid validation rules.";
        }

        if (field.field_type === "select") {

            const options = rules.allowedValues;

            if (
                !Array.isArray(options) ||
                options.length === 0 ||
                options.length > 100 ||
                options.some(option =>
                    typeof option !== "string" ||
                    !option.trim() ||
                    option.length > 255
                ) ||
                new Set(options).size !== options.length
            ) {
                return "Dropdown options must be unique, nonempty strings (maximum 100).";
            }

        } else if (Object.keys(rules).length !== 0) {
            return "Unexpected validation rules for field type.";
        }
    }

    return null;
}

module.exports = { validateTemplate };
