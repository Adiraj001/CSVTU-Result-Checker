const studentSearch = document.getElementById("studentSearch");
const studentList = document.getElementById("studentList");
const studentStatus = document.getElementById("studentStatus");
const rollNoInput = document.getElementById("rollNo");
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

    if (!action || !semester || !examMonth || !examYear) {
        alert("Please fill all fields");
        return;
    }

    // Semester format: "5 Semester"
    const semesterParam = `${semester} Semester`;

    // Exam session format: "NOV-DEC 2025"
    const sessionParam = `${examMonth.toUpperCase()} ${examYear}`;

    let url = "";

    if (action === "result") {
        url = `https://csvtu.digivarsity.online/WebApp/Result/SemesterResult.aspx?S=${encodeURIComponent(semesterParam)}&E=${encodeURIComponent(sessionParam)}&R=${rollNo}&T=${examType}`;
    } else {
        url = `https://csvtu.digivarsity.online/WebApp/AdmitCard/AdmitCard.aspx?S=${encodeURIComponent(semesterParam)}&E=${encodeURIComponent(sessionParam)}&R=${rollNo}&T=${examType}`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
});
