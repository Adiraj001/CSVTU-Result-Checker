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

    const rollNo = document.getElementById("rollNo").value.trim();
    const action = document.getElementById("action").value;
    const examType = document.getElementById("examType").value;
    const semester = document.getElementById("semester").value;
    const examMonth = document.getElementById("examMonth").value;
    const examYear = document.getElementById("examYear").value;

    // Validation
    if (!rollNo || rollNo.length !== 12) {
        alert("Please enter a valid 12-digit roll number");
        return;
    }

    if (!action || !semester || !examMonth || !examYear) {
        alert("Please fill all fields");
        return;
    }

    /* 🔥 CRITICAL FIXES 🔥 */

    // Semester format: "1 SEMESTER"
    const semesterParam = `${semester} SEMESTER`;

    // Exam session format: "NOV-DEC 2023"
    const sessionParam = `${examMonth.toUpperCase()} ${examYear}`;

    let url = "";

    if (action === "result") {
        url = `https://csvtu.digivarsity.online/WebApp/Result/SemesterResult.aspx?S=${encodeURIComponent(semesterParam)}&E=${encodeURIComponent(sessionParam)}&R=${rollNo}&T=${examType}`;
    } else {
        url = `https://csvtu.digivarsity.online/WebApp/AdmitCard/AdmitCard.aspx?S=${encodeURIComponent(semesterParam)}&E=${encodeURIComponent(sessionParam)}&R=${rollNo}&T=${examType}`;
    }

    window.open(url, "_blank");
});
