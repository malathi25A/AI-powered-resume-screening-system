/**
 * Email Notification Utility — Nodemailer + Gmail SMTP
 */
const nodemailer = require('nodemailer');

// ── Transporter ───────────────────────────────────────────────
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send shortlist notification to HR
 */
async function sendShortlistNotification(hrEmail, candidateName, jobTitle, score, recommendation) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email not configured — skipping notification');
    return false;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
      .card { background: white; border-radius: 12px; padding: 32px; max-width: 560px; margin: 0 auto; }
      .header { background: linear-gradient(135deg, #38bdf8, #818cf8); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px; }
      .header h1 { color: white; margin: 0; font-size: 22px; }
      .score { font-size: 48px; font-weight: bold; color: #34d399; text-align: center; }
      .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; background: #d1fae5; color: #059669; font-weight: bold; }
      .footer { margin-top: 24px; color: #6b7280; font-size: 12px; text-align: center; }
    </style></head>
    <body>
      <div class="card">
        <div class="header"><h1>🎯 SmartHire AI — Candidate Shortlisted</h1></div>
        <p>Hi HR Team,</p>
        <p>A candidate has been shortlisted for <strong>${jobTitle}</strong>:</p>
        <div class="score">${score}/100</div>
        <p style="text-align:center;font-size:20px;font-weight:bold">${candidateName}</p>
        <p style="text-align:center"><span class="badge">${recommendation}</span></p>
        <p>Log in to SmartHire AI to view the full evaluation report, schedule an interview, or download the PDF report.</p>
        <div class="footer">SmartHire AI — Powered by Google Gemini · This is an automated notification.</div>
      </div>
    </body>
    </html>
  `;

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || `SmartHire AI <${process.env.EMAIL_USER}>`,
      to: hrEmail,
      subject: `⭐ ${candidateName} Shortlisted for ${jobTitle} — Score: ${score}/100`,
      html,
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', err.message);
    return false;
  }
}

/**
 * Send evaluation complete notification
 */
async function sendEvaluationComplete(hrEmail, jobTitle, totalEvaluated, shortlistedCount) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return false;

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || `SmartHire AI <${process.env.EMAIL_USER}>`,
      to: hrEmail,
      subject: `✅ AI Evaluation Complete — ${jobTitle} (${totalEvaluated} candidates)`,
      html: `
        <div style="font-family:Arial;max-width:500px;margin:0 auto">
          <h2 style="color:#38bdf8">AI Evaluation Complete</h2>
          <p>Evaluation for <strong>${jobTitle}</strong> is done.</p>
          <ul>
            <li>Total evaluated: <strong>${totalEvaluated}</strong></li>
            <li>Shortlisted: <strong>${shortlistedCount}</strong></li>
          </ul>
          <p>Visit SmartHire AI to review results.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
}

module.exports = { sendShortlistNotification, sendEvaluationComplete };
