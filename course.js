const MISSING_TEXT = "Not specified";

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
}
