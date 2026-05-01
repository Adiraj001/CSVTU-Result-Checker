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

function loadStudentOptions(studentRows) {
    studentList.innerHTML = "";

    studentRows.forEach((student) => {
        const option = document.createElement("option");
        option.value = `${student.name} - ${student.rollNumber}`;
        studentList.appendChild(option);
    });
}

async function loadStudents() {
    try {
        if (Array.isArray(window.STUDENT_DATA)) {
            students = window.STUDENT_DATA
                .map((student) => ({
                    name: student.name.trim(),
                    rollNumber: student.rollNumber.trim(),
                }))
                .filter((student) => student.name && /^\d{12}$/.test(student.rollNumber));

            loadStudentOptions(students);
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

        loadStudentOptions(students);
        studentStatus.textContent = `${students.length} students loaded`;
    } catch (error) {
        studentStatus.textContent = "Student list unavailable. Enter roll number manually.";
    }
}

studentSearch.addEventListener("change", () => {
    const selectedStudent = students.find((student) => {
        const optionValue = `${student.name} - ${student.rollNumber}`;
        return optionValue === studentSearch.value;
    });

    if (selectedStudent) {
        rollNoInput.value = selectedStudent.rollNumber;
    }
});

studentSearch.addEventListener("input", () => {
    const selectedStudent = students.find((student) => {
        const optionValue = `${student.name} - ${student.rollNumber}`;
        return optionValue === studentSearch.value;
    });

    if (selectedStudent) {
        rollNoInput.value = selectedStudent.rollNumber;
    }
});

loadStudents();

// Populate Exam Year dropdown
const yearSelect = document.getElementById("examYear");
const currentYear = new Date().getFullYear();

for (let year = currentYear; year >= 2015; year--) {
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

    // Semester format: "5 Semester"
    const semesterParam = `${semester} Semester`;

    // Exam session format: "NOV-DEC 2025"
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
