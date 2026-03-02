/**
 * SmartHire AI Engine — Groq API Service
 * Core resume evaluation engine using Groq (llama-3.3-70b-versatile)
 */
const Groq = require('groq-sdk');

let groqClient = null;

function getClient() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not configured in .env');
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

function buildPrompt(resumeText, jobDescription) {
  return `You are an expert HR specialist and AI resume screening engine. Analyze the resume against the job description with deep expertise.

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
3. Compute the overall weighted score using the weights above
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
  "summary": "3-4 sentence professional summary of the candidate fit for this role",
  "strengths": [
    "Strength 1 with specific evidence from resume",
    "Strength 2 with specific evidence from resume",
    "Strength 3 with specific evidence from resume"
  ],
  "improvements": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2"
  ],
  "experienceAnalysis": "2-3 sentence analysis of experience relevance",
  "educationAnalysis": "1-2 sentence analysis of education match",
  "atsIssues": ["ATS issue 1 if any", "ATS issue 2 if any"]
}

SCORING GUIDE:
- Skills 90-100: All required skills present | 70-89: Most present | 50-69: Several missing | <50: Major gaps
- Experience 90-100: Exceeds requirement | 70-89: Meets minimum | 50-69: Below but relevant | <50: Significantly below
- Education 90-100: Exact match or higher | 70-89: Slightly below | <70: Below requirement
- Keywords 80-100: Rich keyword usage | 50-79: Moderate | <50: Poor
- ATS 80-100: Well formatted | 50-79: Minor issues | <50: Poor formatting

Recommendation rules: overall >= 75 = "Strong Fit", 50-74 = "Moderate Fit", <50 = "Not Recommended"

Return ONLY the JSON object. No extra text.`;
}

async function evaluateResume(resumeText, jobDescription) {
  const client = getClient();
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const prompt = buildPrompt(resumeText, jobDescription);

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are SmartHire AI Engine — an expert resume screening system. Always respond with valid JSON only. Never include markdown, code fences, or explanations.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 4096,
      });

      const rawText = completion.choices[0]?.message?.content || '';

      // Strip accidental markdown fences
      const cleanText = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      const parsed = JSON.parse(cleanText);

      if (!parsed.scores || typeof parsed.scores.overall !== 'number') {
        throw new Error('Invalid response structure from AI engine');
      }

      // Clamp scores 0–100
      Object.keys(parsed.scores).forEach(key => {
        parsed.scores[key] = Math.min(100, Math.max(0, Math.round(parsed.scores[key])));
      });

      // Align recommendation with score
      const overall = parsed.scores.overall;
      if (overall >= 75)      parsed.recommendation = 'Strong Fit';
      else if (overall >= 50) parsed.recommendation = 'Moderate Fit';
      else                    parsed.recommendation = 'Not Recommended';

      return { ...parsed, rawResponse: rawText };

    } catch (err) {
      console.error(`SmartHire Engine attempt ${attempt} failed:`, err.message);
      if (attempt === maxAttempts) {
        throw new Error(`SmartHire AI Engine failed after ${maxAttempts} attempts: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
}

function extractBasicInfo(text) {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return {
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
  };
}

module.exports = { evaluateResume, extractBasicInfo };
