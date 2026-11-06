const fileInput = document.getElementById("file-input");
const errorMessage = document.getElementById("error-message");
const courseList = document.getElementById("course-list");
const courseDetails = document.getElementById("course-details");

// each filter dropdown + the course field it reads
const filterConfigs = [
    { select: document.getElementById("department-filter"), field: "department", isNumeric: false },
    { select: document.getElementById("level-filter"), field: "level", isNumeric: true },
    { select: document.getElementById("credits-filter"), field: "credits", isNumeric: true },
    { select: document.getElementById("instructor-filter"), field: "instructor", isNumeric: false }
];

let allCourses = [];
let selectedCourse = null;

function showError(message) {
    errorMessage.textContent = message;
}

function clearError() {
    errorMessage.textContent = "";
}

// entries need to be real objects with an id, everything else gets skipped
function isValidCourseData(entry) {
    return typeof entry === "object" && entry !== null && !Array.isArray(entry)
        && Course.cleanText(entry.id) !== MISSING_TEXT;
}

function parseCourses(fileText) {
    if (fileText.trim() === "") {
        throw new Error("The file is empty.");
    }

    let parsedData;
    try {
        parsedData = JSON.parse(fileText);
    } catch (parseError) {
        throw new Error("The file isn't valid JSON.");
    }

    if (!Array.isArray(parsedData)) {
        throw new Error("Expected a list of courses in the file.");
    }

    const validEntries = parsedData.filter(isValidCourseData);
    if (validEntries.length === 0) {
        throw new Error("No valid courses found in the file.");
    }

    return {
        courses: validEntries.map((entry) => new Course(entry)),
        skippedCount: parsedData.length - validEntries.length
    };
}

function showPlaceholderDetails() {
    courseDetails.innerHTML = "";
    const placeholder = document.createElement("p");
    placeholder.className = "placeholder-text";
    placeholder.textContent = "Select a course to see its details.";
    courseDetails.appendChild(placeholder);
}

function selectCourse(course, listItem) {
    selectedCourse = course;
    courseDetails.innerHTML = "";
    courseDetails.appendChild(course.createDetailsElement());

    // only one item highlighted at a time
    courseList.querySelectorAll(".course-item.selected")
        .forEach((item) => item.classList.remove("selected"));
    listItem.classList.add("selected");
}

function renderCourseList(courses) {
    courseList.innerHTML = "";

    courses.forEach((course) => {
        const listItem = document.createElement("li");
        listItem.className = "course-item";
        listItem.textContent = course.getDisplayLabel();
        if (course === selectedCourse) {
            listItem.classList.add("selected");
        }
        listItem.addEventListener("click", () => selectCourse(course, listItem));
        courseList.appendChild(listItem);
    });
}

function getUniqueValues(courses, field, isNumeric) {
    const values = courses
        .map((course) => course[field])
        .filter((value) => value !== null && value !== MISSING_TEXT);

    const uniqueValues = [...new Set(values)];
    return isNumeric
        ? uniqueValues.sort((a, b) => a - b)
        : uniqueValues.sort((a, b) => a.localeCompare(b));
}

function populateFilter(config, courses) {
    config.select.innerHTML = "";
    config.select.appendChild(new Option("All", "all"));

    getUniqueValues(courses, config.field, config.isNumeric).forEach((value) => {
        config.select.appendChild(new Option(String(value), String(value)));
    });
}

function populateAllFilters(courses) {
    filterConfigs.forEach((config) => populateFilter(config, courses));
}

function getActiveFilters() {
    const filters = {};
    filterConfigs.forEach((config) => {
        filters[config.field] = config.select.value;
    });
    return filters;
}

function updateCourseList() {
    const filters = getActiveFilters();
    const visibleCourses = allCourses.filter((course) => course.matchesFilters(filters));
    renderCourseList(visibleCourses);

    if (allCourses.length > 0 && visibleCourses.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "placeholder-text";
        emptyItem.textContent = "No courses match these filters.";
        courseList.appendChild(emptyItem);
    }
}

function handleFileText(fileText) {
    try {
        const { courses, skippedCount } = parseCourses(fileText);
        allCourses = courses;
        selectedCourse = null;
        showPlaceholderDetails();
        populateAllFilters(allCourses);
        updateCourseList();

        if (skippedCount > 0) {
            showError(`Skipped ${skippedCount} invalid course entr${skippedCount === 1 ? "y" : "ies"}.`);
        } else {
            clearError();
        }
    } catch (loadError) {
        allCourses = [];
        selectedCourse = null;
        showPlaceholderDetails();
        populateAllFilters(allCourses);
        updateCourseList();
        showError(`Couldn't load courses: ${loadError.message}`);
    }
}

function handleFileSelect(event) {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
        return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".json")) {
        showError("Please pick a .json file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = () => handleFileText(reader.result);
    reader.onerror = () => showError("Couldn't read the file.");
    reader.readAsText(selectedFile);
}

fileInput.addEventListener("change", handleFileSelect);
filterConfigs.forEach((config) => config.select.addEventListener("change", updateCourseList));
