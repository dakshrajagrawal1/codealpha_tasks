// ============================================================
// utils/sendEmail.js
// Email notification utility using Nodemailer
// ============================================================

const nodemailer = require('nodemailer');

// ─── Create transporter (Gmail SMTP) ─────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,  // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Main send function ───────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  // In development, just log the email (don't actually send)
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    console.log('\n📧 EMAIL (dev mode - not sent):');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('---\n');
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'JobBoard <noreply@jobboard.com>',
    to,
    subject,
    html,
  });
};

// ─── Email Templates ──────────────────────────────────────────

// Sent to candidate when application is submitted
const applicationConfirmationEmail = (candidateName, jobTitle, company) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1a1a2e; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Application Submitted!</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been successfully submitted.</p>
    <p>We'll notify you when the employer reviews your application.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6c63ff;">
      <p style="margin: 0;"><strong>Position:</strong> ${jobTitle}</p>
      <p style="margin: 8px 0 0;"><strong>Company:</strong> ${company}</p>
    </div>
    <a href="${process.env.CLIENT_URL}/dashboard" style="background: #6c63ff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 10px;">
      View My Applications
    </a>
  </div>
</div>
`;

// Sent to employer when a new application comes in
const newApplicationEmail = (employerName, candidateName, jobTitle, applicationId) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1a1a2e; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">New Application Received</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>${employerName}</strong>,</p>
    <p><strong>${candidateName}</strong> has applied for <strong>${jobTitle}</strong>.</p>
    <a href="${process.env.CLIENT_URL}/employer/applications/${applicationId}" style="background: #6c63ff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 10px;">
      Review Application
    </a>
  </div>
</div>
`;

// Sent to candidate when their application status changes
const statusUpdateEmail = (candidateName, jobTitle, company, status) => {
  const messages = {
    reviewing: 'Your application is now being reviewed.',
    shortlisted: '🎉 Great news! You have been shortlisted!',
    interview: '🎉 Congratulations! You have been selected for an interview!',
    offered: '🎊 Amazing! You have received a job offer!',
    rejected: 'Thank you for your interest. The employer has decided to move forward with other candidates.'
  };

  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #1a1a2e; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Application Update</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>${candidateName}</strong>,</p>
    <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been updated.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6c63ff;">
      <p style="margin: 0;">${messages[status] || 'Your application status has been updated to: ' + status}</p>
    </div>
    <a href="${process.env.CLIENT_URL}/dashboard" style="background: #6c63ff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 10px;">
      View Application
    </a>
  </div>
</div>
`;
};

module.exports = {
  sendEmail,
  applicationConfirmationEmail,
  newApplicationEmail,
  statusUpdateEmail
};
