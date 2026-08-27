const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Allow requests from the frontend
app.use(cors());

// Allow the server to receive JSON data
app.use(express.json({ limit: "2mb" }));

console.log(
    "API key loaded:",
    process.env.GEMINI_API_KEY ? "YES" : "NO"
);

// Create the Gemini client
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Test route
app.get("/", (request, response) => {
    response.send("AI Resume Analyzer backend is running!");
});

// Resume-analysis route
app.post("/analyze", async (request, response) => {
    try {
        const { resume, jobDescription } = request.body;

        // Validate the input
        if (!resume || !jobDescription) {
            return response.status(400).json({
                error: "Resume and job description are required."
            });
        }

        const prompt = `
You are an experienced technical recruiter.

Compare the following resume with the job description.

Evaluate the candidate based on:
- Required qualifications
- Preferred qualifications
- Technical skills
- Projects
- Work experience
- Transferable experience
- Communication and collaboration evidence

Understand meaning and context. Do not perform only exact
keyword matching.

Return ONLY one valid JSON object using exactly this structure:

{
  "matchScore": 0,
  "matchedSkills": [
    "A matching skill with a short explanation"
  ],
  "missingSkills": [
    "A missing or unclear skill with a short explanation"
  ],
  "strengths": [
    "A relevant candidate strength"
  ],
  "improvements": [
    "A specific resume improvement"
  ]
}

Important rules:
- matchScore must be an integer between 0 and 100.
- All other properties must be arrays of strings.
- Do not use Markdown.
- Do not use headings.
- Do not use backticks.
- Do not wrap the JSON inside a code block.
- Do not write anything before or after the JSON.
- Do not invent skills or qualifications.
- Treat required and preferred qualifications differently.
- Keep every list item concise and useful.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}
`;

        // Send the resume and job description to Gemini
        const result = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        const rawText = result.text.trim();

        console.log("Raw AI response:", rawText);

        // Extract the JSON object if Gemini adds extra text
        const firstBrace = rawText.indexOf("{");
        const lastBrace = rawText.lastIndexOf("}");

        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error(
                "The AI response did not contain a JSON object."
            );
        }

        const jsonText = rawText.slice(
            firstBrace,
            lastBrace + 1
        );

        const analysis = JSON.parse(jsonText);

        // Check that the response contains the required properties
        if (
            typeof analysis.matchScore !== "number" ||
            !Array.isArray(analysis.matchedSkills) ||
            !Array.isArray(analysis.missingSkills) ||
            !Array.isArray(analysis.strengths) ||
            !Array.isArray(analysis.improvements)
        ) {
            throw new Error(
                "The AI returned an unexpected response structure."
            );
        }

        // Keep the score within the valid range
        analysis.matchScore = Math.max(
            0,
            Math.min(100, Math.round(analysis.matchScore))
        );

        response.json({
            analysis: analysis
        });
    } catch (error) {
        console.error("AI error:", error);

        response.status(500).json({
            error:
                "AI analysis failed. Check the server terminal."
        });
    }
});

// Start the backend
app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});