const studentSearch = document.getElementById("studentSearch");
const studentList = document.getElementById("studentList");
const studentStatus = document.getElementById("studentStatus");
const rollNoInput = document.getElementById("rollNo");
const securityStatus = document.getElementById("securityStatus");
const officialHost = "csvtu.digivarsity.online";
const allowedActions = new Set(["result", "admit"]);
const allowedExamTypes = new Set(["Regular", "RTRV", "Backlog"]);
const allowedSemesters = new Set(["1", "2", "3", "4", "5", "6", "7", "8"]);
const allowedExamMonths = new Set(["NOV-DEC", "APR-MAY"]);
let students = [];
let filteredStudents = [];
let selectedIndex = -1;
let isDropdownOpen = false;

function parseCsvLine(line) {
    const values = [];
    let value = "";
    let insideQuotes = false;

    for (let index = 0; index < line.length; index++) {
        const char = line[index];
        const nextChar = line[index + 1];

        if (char === '"' && nextChar === '"') {
            value += '"';
            index++;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
            values.push(value);
            value = "";
        } else {
            value += char;
        }
    }

    values.push(value);
    return values;
}

function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderDropdown() {
    studentList.innerHTML = "";

    if (filteredStudents.length === 0) {
        const li = document.createElement("li");
        li.className = "autocomplete-empty";
        li.textContent = "No matches found";
        studentList.appendChild(li);
        return;
    }

    filteredStudents.forEach((student, index) => {
        const li = document.createElement("li");
        li.className = "autocomplete-item";
        li.dataset.index = index;
        li.dataset.roll = student.rollNumber;
        li.dataset.name = student.name;

        const nameHtml = highlightMatch(student.name, studentSearch.value);
        const rollHtml = highlightMatch(student.rollNumber, studentSearch.value);

        li.innerHTML = `
            <span class="autocomplete-name">${nameHtml}</span>
            <span class="autocomplete-roll">${rollHtml}</span>
        `;

        if (index === selectedIndex) {
            li.classList.add("selected");
        }

        li.addEventListener("click", () => selectStudent(student));
        li.addEventListener("mouseenter", () => {
            selectedIndex = index;
            updateSelection();
        });

        studentList.appendChild(li);
    });
}

function updateSelection() {
    const items = studentList.querySelectorAll(".autocomplete-item");
    items.forEach((item, index) => {
        item.classList.toggle("selected", index === selectedIndex);
    });
}

function filterStudents(query) {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) {
        filteredStudents = [];
        return;
    }

    filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(lowerQuery) ||
        student.rollNumber.includes(lowerQuery)
    ).slice(0, 10);
}

function showDropdown() {
    if (filteredStudents.length > 0) {
        studentList.classList.add("open");
        isDropdownOpen = true;
    }
}

function hideDropdown() {
    studentList.classList.remove("open");
    isDropdownOpen = false;
    selectedIndex = -1;
}

function selectStudent(student) {
    studentSearch.value = student.name;
    rollNoInput.value = student.rollNumber;
    hideDropdown();
    studentSearch.blur();
}

function handleKeydown(e) {
    if (!isDropdownOpen) return;

    const items = studentList.querySelectorAll(".autocomplete-item:not(.autocomplete-empty)");

    switch (e.key) {
        case "ArrowDown":
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection();
            break;
        case "ArrowUp":
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelection();
            break;
        case "Enter":
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
                const roll = items[selectedIndex].dataset.roll;
                const name = items[selectedIndex].dataset.name;
                selectStudent({ name, rollNumber: roll });
            }
            break;
        case "Escape":
            hideDropdown();
            studentSearch.blur();
            break;
        case "Tab":
            hideDropdown();
            break;
    }
}

async function loadStudents() {
    try {
        studentStatus.textContent = "Loading student list...";

        if (Array.isArray(window.STUDENT_DATA)) {
            students = window.STUDENT_DATA
                .map((student) => ({
                    name: student.name.trim(),
                    rollNumber: student.rollNumber.trim(),
                }))
                .filter((student) => student.name && /^\d{12}$/.test(student.rollNumber));

            studentStatus.textContent = `${students.length} students loaded`;
            return;
        }

        const response = await fetch("DATA/studentdata.csv");

        if (!response.ok) {
            throw new Error("Student data file could not be loaded.");
        }

        const csvText = await response.text();
        const lines = csvText.trim().split(/\r?\n/).slice(1);

        students = lines
            .map(parseCsvLine)
            .map(([name, rollNumber]) => ({
                name: name.trim(),
                rollNumber: rollNumber.trim(),
            }))
            .filter((student) => student.name && /^\d{12}$/.test(student.rollNumber));

        studentStatus.textContent = `${students.length} students loaded`;
    } catch (error) {
        studentStatus.textContent = "Student list unavailable. Enter roll number manually.";
    }
}

studentSearch.addEventListener("input", () => {
    const query = studentSearch.value;
    filterStudents(query);
    renderDropdown();
    showDropdown();
    selectedIndex = -1;
});

studentSearch.addEventListener("focus", () => {
    if (studentSearch.value.trim()) {
        filterStudents(studentSearch.value);
        renderDropdown();
        showDropdown();
    }
});

studentSearch.addEventListener("keydown", handleKeydown);

document.addEventListener("click", (e) => {
    if (!studentSearch.contains(e.target) && !studentList.contains(e.target)) {
        hideDropdown();
    }
});

studentSearch.addEventListener("change", () => {
    const selectedStudent = students.find((student) =>
        student.name === studentSearch.value
    );
    if (selectedStudent) {
        rollNoInput.value = selectedStudent.rollNumber;
    }
});

loadStudents();

// Populate Exam Year dropdown
const yearSelect = document.getElementById("examYear");
const currentYear = new Date().getFullYear();

for (let year = currentYear + 1; year >= 2015; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
}

// Button click handler
document.getElementById("openBtn").addEventListener("click", () => {
    securityStatus.textContent = "";

    const rollNo = rollNoInput.value.trim();
    const action = document.getElementById("action").value;
    const examType = document.getElementById("examType").value;
    const semester = document.getElementById("semester").value;
    const examMonth = document.getElementById("examMonth").value;
    const examYear = document.getElementById("examYear").value;

    if (!/^\d{12}$/.test(rollNo)) {
        alert("Please enter a valid 12-digit roll number");
        return;
    }

    if (!allowedActions.has(action) || !allowedExamTypes.has(examType) || !allowedSemesters.has(semester) || !allowedExamMonths.has(examMonth) || !/^\d{4}$/.test(examYear)) {
        alert("Please select valid form values");
        return;
    }

    const semesterParam = `${semester} Semester`;
    const sessionParam = `${examMonth.toUpperCase()} ${examYear}`;

    const pagePath = action === "result"
        ? "/WebApp/Result/SemesterResult.aspx"
        : "/WebApp/AdmitCard/AdmitCard.aspx";

    const url = new URL(`https://${officialHost}${pagePath}`);
    url.search = new URLSearchParams({
        S: semesterParam,
        E: sessionParam,
        R: rollNo,
        T: examType,
    }).toString();

    if (url.protocol !== "https:" || url.hostname !== officialHost) {
        securityStatus.textContent = "Blocked unsafe redirect.";
        return;
    }

    securityStatus.textContent = "Opening verified official CSVTU page...";
    window.open(url.toString(), "_blank", "noopener,noreferrer");
});