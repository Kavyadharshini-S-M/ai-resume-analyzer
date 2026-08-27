const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

console.log(
    "API key loaded:",
    process.env.GEMINI_API_KEY ? "YES" : "NO"
);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (request, response) => {
    response.send("AI Resume Analyzer backend is running!");
});

app.post("/analyze", async (request, response) => {
    try {
        const { resume, jobDescription } = request.body;

        if (!resume || !jobDescription) {
            return response.status(400).json({
                error: "Resume and job description are required."
            });
        }

        const prompt = `
You are an expert technical recruiter and resume reviewer.

Compare the candidate's resume with the job description.

Evaluate meaning and transferable experience—not merely exact keyword matches.

Return your answer using exactly these headings:

MATCH SCORE:
A realistic score from 0 to 100.

MATCHED SKILLS:
Skills and experience that match the job.

MISSING SKILLS:
Important requirements that are absent or unclear.

STRENGTHS:
The strongest parts of the resume for this position.

IMPROVEMENTS:
Specific and honest improvements the candidate should make.

Do not invent qualifications that are not present in the resume.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}
`;

        const result = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt
});


        response.json({
            analysis: result.text
        });
    } catch (error) {
        console.error("AI error:", error);

        response.status(500).json({
            error: "AI analysis failed. Check the server terminal."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});