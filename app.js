const fileInput = document.getElementById("file-input");
const errorMessage = document.getElementById("error-message");
const courseList = document.getElementById("course-list");

let allCourses = [];

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

function renderCourseList(courses) {
    courseList.innerHTML = "";

    courses.forEach((course) => {
        const listItem = document.createElement("li");
        listItem.className = "course-item";
        listItem.textContent = course.getDisplayLabel();
        courseList.appendChild(listItem);
    });
}

function handleFileText(fileText) {
    try {
        const { courses, skippedCount } = parseCourses(fileText);
        allCourses = courses;
        renderCourseList(allCourses);

        if (skippedCount > 0) {
            showError(`Skipped ${skippedCount} invalid course entr${skippedCount === 1 ? "y" : "ies"}.`);
        } else {
            clearError();
        }
    } catch (loadError) {
        allCourses = [];
        renderCourseList(allCourses);
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
