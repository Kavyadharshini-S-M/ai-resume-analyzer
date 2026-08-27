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

const analysisSchema = {
    type: "object",

    properties: {
        matchScore: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description: "Estimated resume and job match score"
        },

        matchedSkills: {
            type: "array",
            items: {
                type: "string"
            },
            description: "Skills and experiences matching the job"
        },

        missingSkills: {
            type: "array",
            items: {
                type: "string"
            },
            description: "Important missing or unclear skills"
        },

        strengths: {
            type: "array",
            items: {
                type: "string"
            },
            description: "Candidate strengths relevant to the job"
        },

        improvements: {
            type: "array",
            items: {
                type: "string"
            },
            description: "Specific resume improvement suggestions"
        }
    },

    required: [
        "matchScore",
        "matchedSkills",
        "missingSkills",
        "strengths",
        "improvements"
    ],

    additionalProperties: false
};

app.post("/analyze", async (request, response) => {
    try {
        const { resume, jobDescription } = request.body;

        if (!resume || !jobDescription) {
            return response.status(400).json({
                error: "Resume and job description are required."
            });
        }

const prompt = `
Act as an experienced technical recruiter.

Compare the resume and job description based on meaning,
evidence and transferable experience—not only exact keywords.

Rules:
- Give a realistic match score from 0 to 100.
- Do not invent qualifications.
- Keep each list item concise and specific.
- Treat preferred skills differently from required skills.
- Mention important requirements that are absent or unclear.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}
`;

const result = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,

    config: {
        responseFormat: {
            text: {
                mimeType: "application/json",
                schema: analysisSchema
            }
        }
    }
});

const analysis = JSON.parse(result.text);

response.json({
    analysis: analysis
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