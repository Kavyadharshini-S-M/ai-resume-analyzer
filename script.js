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

    setLoading(true);

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

        displayAnalysis(data.analysis);
    } catch (error) {
        resultMessage.textContent = error.message;
    } finally {
        setLoading(false);
    }
}

function setLoading(isLoading) {
    analyzeButton.disabled = isLoading;

    analyzeButton.textContent = isLoading
        ? "Analyzing with AI..."
        : "Analyze Resume";
}

function displayAnalysis(analysis) {
    resultMessage.replaceChildren();

    const scoreCard = document.createElement("div");
    scoreCard.className = "score-card";

    const score = document.createElement("div");
    score.className = "score";
    score.textContent = `${analysis.matchScore}%`;

    const scoreLabel = document.createElement("p");
    scoreLabel.textContent = "AI-estimated match score";

    scoreCard.append(score, scoreLabel);
    resultMessage.appendChild(scoreCard);

    resultMessage.appendChild(
        createTagSection(
            "Matched Skills",
            analysis.matchedSkills,
            "matched"
        )
    );

    resultMessage.appendChild(
        createTagSection(
            "Missing Skills",
            analysis.missingSkills,
            "missing"
        )
    );

    resultMessage.appendChild(
        createListSection(
            "Strengths",
            analysis.strengths
        )
    );

    resultMessage.appendChild(
        createListSection(
            "Improvements",
            analysis.improvements
        )
    );
}

function createTagSection(title, items, tagClass) {
    const section = document.createElement("section");
    section.className = "result-card";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const tagContainer = document.createElement("div");
    tagContainer.className = "tag-container";

    for (const item of items) {
        const tag = document.createElement("span");
        tag.className = `tag ${tagClass}`;
        tag.textContent = item;
        tagContainer.appendChild(tag);
    }

    section.append(heading, tagContainer);

    return section;
}

function createListSection(title, items) {
    const section = document.createElement("section");
    section.className = "result-card";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const list = document.createElement("ul");

    for (const item of items) {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        list.appendChild(listItem);
    }

    section.append(heading, list);

    return section;
}