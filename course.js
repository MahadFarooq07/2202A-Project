const MISSING_TEXT = "Not specified";
const TERM_ORDER = ["winter", "spring", "summer", "fall"];

class Course {
    constructor(courseData) {
        this._id = Course.cleanText(courseData.id);
        this._title = Course.cleanText(courseData.title);
        this._department = Course.cleanText(courseData.department);
        this._level = Course.cleanNumber(courseData.level);
        this._credits = Course.cleanNumber(courseData.credits);
        this._instructor = Course.cleanText(courseData.instructor);
        this._description = Course.cleanText(courseData.description);
        this._semester = Course.cleanText(courseData.semester);
    }

    static cleanText(value) {
        if (typeof value === "string" && value.trim() !== "") {
            return value.trim();
        }
        if (typeof value === "number" && Number.isFinite(value)) {
            return String(value);
        }
        return MISSING_TEXT;
    }

    static cleanNumber(value) {
        if (typeof value === "number" && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === "string" && value.trim() !== "") {
            const parsedNumber = Number(value.trim());
            return Number.isFinite(parsedNumber) ? parsedNumber : null;
        }
        return null;
    }

    get id() {
        return this._id;
    }

    get title() {
        return this._title;
    }

    get department() {
        return this._department;
    }

    get level() {
        return this._level;
    }

    get credits() {
        return this._credits;
    }

    get instructor() {
        return this._instructor;
    }

    get description() {
        return this._description;
    }

    get semester() {
        return this._semester;
    }

    static formatNumber(value) {
        return value === null ? MISSING_TEXT : String(value);
    }

    // "Fall 2025" -> 2025 * 4 + 3, so later terms get bigger numbers
    getSemesterSortKey() {
        const match = this._semester.match(/^(winter|spring|summer|fall)\s+(\d{4})$/i);
        if (!match) {
            return null;
        }
        return Number(match[2]) * 4 + TERM_ORDER.indexOf(match[1].toLowerCase());
    }

    // filters look like { department: "Art", level: "all", ... }
    matchesFilters(filters) {
        return Object.entries(filters).every(([field, value]) =>
            value === "all" || String(this[field]) === value
        );
    }

    getDisplayLabel() {
        return this._id;
    }

    getDetailFields() {
        return [
            { label: "Title", value: this._title },
            { label: "Department", value: this._department },
            { label: "Level", value: Course.formatNumber(this._level) },
            { label: "Credits", value: Course.formatNumber(this._credits) },
            { label: "Instructor", value: this._instructor },
            { label: "Semester", value: this._semester }
        ];
    }

    createDetailsElement() {
        const container = document.createElement("div");

        const heading = document.createElement("h3");
        heading.textContent = this._id;
        container.appendChild(heading);

        this.getDetailFields().forEach((field) => {
            const row = document.createElement("p");
            const label = document.createElement("strong");
            label.textContent = `${field.label}: `;
            row.appendChild(label);
            row.appendChild(document.createTextNode(field.value));
            container.appendChild(row);
        });

        const description = document.createElement("p");
        description.className = "course-description";
        description.textContent = this._description;
        container.appendChild(description);

        return container;
    }
}
