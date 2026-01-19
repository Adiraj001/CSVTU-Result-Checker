document.getElementById('portalForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Stop form from trying to refresh the page

    // 1. Get Values
    const roll = document.getElementById('roll').value.trim();
    const semester = document.getElementById('semester').value;
    const session = document.getElementById('exam_session').value;
    const action = document.getElementById('action').value;
    const examType = document.getElementById('exam_type').value;
    const errorBox = document.getElementById('errorMessage');

    // 2. Validation (Logic from your app.py)
    const isNumeric = /^\d+$/.test(roll);
    if (!isNumeric || roll.length !== 12) {
        errorBox.textContent = "Invalid roll number format (must be 12 digits)";
        errorBox.style.display = "block";
        return;
    }
    errorBox.style.display = "none";

    // 3. URL Builders (Logic from your app.py)
    const RESULT_BASE = "https://csvtu.digivarsity.online/WebApp/Result/SemesterResult.aspx";
    const ADMIT_BASE = "https://csvtu.digivarsity.online/WebApp/Examination/AdmitCard.aspx";

    let finalUrl = "";

    if (action === "admit") {
        // Build Admit Card URL
        finalUrl = `${ADMIT_BASE}?RollNo=${roll}&ExamSession=${encodeURIComponent(session)}&Semester=${encodeURIComponent(semester)}`;
    } else {
        // Build Result URL
        const typeMap = { "regular": "Regular", "rtrv": "RTRV", "backlog": "Backlog" };
        const tValue = typeMap[examType] || "Regular";
        
        finalUrl = `${RESULT_BASE}?S=${encodeURIComponent(semester)}&E=${encodeURIComponent(session)}&R=${roll}&T=${tValue}`;
    }

    // 4. Redirect
    window.location.href = finalUrl;
});