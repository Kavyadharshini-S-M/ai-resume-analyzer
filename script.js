const resumeInput = document.getElementById("resume");
const jobInput = document.getElementById("jobDescription");
const analyzeButton = document.getElementById("analyzeButton");
const resultsSection = document.getElementById("results");
const resultMessage = document.getElementById("resultMessage");

analyzeButton.addEventListener("click", analyzeResume);

async function analyzeResume() {
    const resume = resumeInput.value.trim();
    const jobDescription = jobInput.value.trim();

    if (!resume || !jobDescription) {
        alert("Please enter both your resume and job description.");
        return;
    }

    analyzeButton.disabled = true;
    analyzeButton.textContent = "Analyzing with AI...";

    resultsSection.style.display = "block";
    resultMessage.textContent = "The AI is reviewing your resume...";

    try {
        const response = await fetch("http://localhost:3000/analyze", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                resume: resume,
                jobDescription: jobDescription
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Analysis failed.");
        }

        resultMessage.textContent = data.analysis;
    } catch (error) {
        resultMessage.textContent = error.message;
    } finally {
        analyzeButton.disabled = false;
        analyzeButton.textContent = "Analyze Resume";
    }
}