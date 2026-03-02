/**
 * Text Extraction Utility
 * Extracts plain text from PDF and DOCX files
 */
const fs = require('fs');
const path = require('path');

/**
 * Extract text from a PDF file using pdf-parse
 */
async function extractFromPDF(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (err) {
    throw new Error(`PDF extraction failed: ${err.message}`);
  }
}

/**
 * Extract text from a DOCX file using mammoth
 */
async function extractFromDOCX(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch (err) {
    throw new Error(`DOCX extraction failed: ${err.message}`);
  }
}

/**
 * Main extraction function — detects file type automatically
 * @param {string} filePath - Absolute path to the file
 * @param {string} fileType - 'pdf' or 'docx'
 * @returns {string} Extracted text
 */
async function extractText(filePath, fileType) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const ext = fileType || path.extname(filePath).replace('.', '').toLowerCase();

  if (ext === 'pdf') {
    return extractFromPDF(filePath);
  } else if (ext === 'docx' || ext === 'doc') {
    return extractFromDOCX(filePath);
  } else {
    throw new Error(`Unsupported file type: ${ext}. Only PDF and DOCX are supported.`);
  }
}

/**
 * Clean extracted text — removes excessive whitespace
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\t/g, ' ')
    .replace(/ {3,}/g, '  ')
    .trim();
}

/**
 * Quick skill extraction using regex patterns
 * Used for a fast preview before Gemini analysis
 */
function quickExtractSkills(text) {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte',
    'Node.js', 'Express', 'FastAPI', 'Django', 'Flask', 'Spring Boot',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Cassandra',
    'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Bitbucket',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'MLflow',
    'REST API', 'GraphQL', 'gRPC', 'WebSocket',
    'Agile', 'Scrum', 'Jira', 'Confluence',
    'Linux', 'Bash', 'PowerShell',
    'HTML', 'CSS', 'SASS', 'Tailwind CSS',
    'CI/CD', 'DevOps', 'Microservices', 'System Design',
  ];

  const found = [];
  const lowerText = text.toLowerCase();

  commonSkills.forEach((skill) => {
    if (lowerText.includes(skill.toLowerCase())) {
      found.push(skill);
    }
  });

  return found;
}

module.exports = { extractText, cleanText, quickExtractSkills };
