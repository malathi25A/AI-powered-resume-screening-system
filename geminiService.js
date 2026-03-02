/**
 * Google Gemini AI Service
 * Core resume evaluation engine using @google/generative-ai
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Initialize Gemini ─────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Build the Gemini evaluation prompt.
 * Returns a strict JSON string from the model.
 */
function buildEvaluationPrompt(resumeText, jobDescription) {
  return `
You are an expert HR specialist and resume screening AI. Analyze the provided resume against the job description with deep expertise.

RESUME TEXT:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
Job Title: ${jobDescription.title}
Department: ${jobDescription.department || 'N/A'}
Required Experience: ${jobDescription.requiredExperience}
Required Education: ${jobDescription.requiredEducation}
Required Skills: ${jobDescription.requiredSkills.join(', ')}
Nice-to-Have Skills: ${(jobDescription.niceToHaveSkills || []).join(', ') || 'None'}
Additional Keywords: ${(jobDescription.additionalKeywords || []).join(', ') || 'None'}
Job Type: ${jobDescription.jobType}
Description: ${jobDescription.description || ''}
"""

SCORING WEIGHTS:
- Skills Match: ${jobDescription.scoringWeights?.skills || 35}%
- Experience: ${jobDescription.scoringWeights?.experience || 30}%
- Education: ${jobDescription.scoringWeights?.education || 15}%
- Keywords: ${jobDescription.scoringWeights?.keywords || 10}%
- ATS Compatibility: ${jobDescription.scoringWeights?.ats || 10}%

INSTRUCTIONS:
1. Carefully read the entire resume and job description
2. Score each category from 0-100 based on alignment
3. Compute the overall weighted score
4. Be strict but fair in your evaluation
5. Extract candidate's actual name, email, phone if present in resume
6. Identify matched skills, missing skills, and bonus skills

RESPOND ONLY WITH VALID JSON — no markdown, no explanation, no code fences:

{
  "candidateName": "Full name extracted from resume",
  "email": "email extracted or empty string",
  "phone": "phone extracted or empty string",
  "location": "location extracted or empty string",
  "experienceYears": 0,
  "educationLevel": "Highest degree mentioned",
  "extractedSkills": ["skill1", "skill2"],
  "scores": {
    "overall": 0,
    "skills": 0,
    "experience": 0,
    "education": 0,
    "keywords": 0,
    "ats": 0
  },
  "recommendation": "Strong Fit | Moderate Fit | Not Recommended",
  "matchedSkills": ["skills found in both resume and JD"],
  "missingSkills": ["required skills NOT found in resume"],
  "extraSkills": ["bonus skills in resume not in JD"],
  "summary": "3-4 sentence professional summary of the candidate's fit for this role",
  "strengths": [
    "Strength 1 with specific evidence",
    "Strength 2 with specific evidence",
    "Strength 3 with specific evidence"
  ],
  "improvements": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2"
  ],
  "experienceAnalysis": "2-3 sentence analysis of experience relevance",
  "educationAnalysis": "1-2 sentence analysis of education match",
  "atsIssues": [
    "ATS compatibility issue 1 if any",
    "ATS compatibility issue 2 if any"
  ]
}

SCORING GUIDE:
- Skills Match 90-100: All or nearly all required skills present
- Skills Match 70-89: Most required skills present with minor gaps
- Skills Match 50-69: Several required skills missing
- Skills Match <50: Major skill gaps
- Experience 90-100: Exact or exceeds requirement
- Experience 70-89: Meets minimum with good quality
- Experience 50-69: Below requirement but some relevant experience
- Experience <50: Significantly below or irrelevant
- Education 90-100: Exact match or higher than required
- Education 70-89: Slightly below but compensated by experience
- Education <70: Below requirement
- Keywords 80-100: Rich keyword usage, naturally integrated
- Keywords 50-79: Some keywords, moderate density
- Keywords <50: Poor keyword usage, needs improvement
- ATS 80-100: Well-formatted, clear sections, parseable
- ATS 50-79: Mostly parseable with minor issues
- ATS <50: Poor formatting, likely to fail ATS parsing

For "recommendation":
- "Strong Fit": overall >= 75
- "Moderate Fit": overall >= 50 AND overall < 75
- "Not Recommended": overall < 50

Return ONLY the JSON object above with no additional text.
`;
}

/**
 * Evaluate a single resume against a job description using Gemini
 * @param {string} resumeText - Extracted text from resume
 * @param {Object} jobDescription - Job description object from DB
 * @returns {Object} Parsed evaluation result
 */
async function evaluateResume(resumeText, jobDescription) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not configured in environment variables');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2, // Low temperature for consistent, factual responses
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 4096,
    },
  });

  const prompt = buildEvaluationPrompt(resumeText, jobDescription);

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const rawText = response.text();

      // Strip any accidental markdown code fences
      const cleanText = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      // Parse JSON
      const parsed = JSON.parse(cleanText);

      // Validate required fields
      if (!parsed.scores || typeof parsed.scores.overall !== 'number') {
        throw new Error('Invalid response structure from Gemini');
      }

      // Clamp all scores to 0-100
      Object.keys(parsed.scores).forEach((key) => {
        parsed.scores[key] = Math.min(100, Math.max(0, Math.round(parsed.scores[key])));
      });

      // Ensure recommendation aligns with overall score
      const overall = parsed.scores.overall;
      if (overall >= 75) parsed.recommendation = 'Strong Fit';
      else if (overall >= 50) parsed.recommendation = 'Moderate Fit';
      else parsed.recommendation = 'Not Recommended';

      return { ...parsed, rawResponse: rawText };
    } catch (err) {
      console.error(`Gemini attempt ${attempt} failed:`, err.message);
      if (attempt === maxAttempts) {
        throw new Error(`Gemini evaluation failed after ${maxAttempts} attempts: ${err.message}`);
      }
      // Wait before retry
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

/**
 * Extract basic candidate info from resume text (fast, no AI)
 * Used as a fallback for quick parsing
 */
function extractBasicInfo(text) {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  return {
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
  };
}

module.exports = { evaluateResume, extractBasicInfo };
