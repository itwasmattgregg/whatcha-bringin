import nodemailer from 'nodemailer';

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('Email configuration missing. Feedback emails will not be sent.');
}

// Create reusable transporter
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

/**
 * Send email notification for new feedback submission
 */
export async function sendFeedbackEmail(feedback: {
  email: string;
  message: string;
  type?: string;
}): Promise<void> {
  if (!transporter || !process.env.FEEDBACK_EMAIL_TO) {
    console.log('Email not configured. Feedback would be sent to:', process.env.FEEDBACK_EMAIL_TO);
    console.log('Feedback details:', feedback);
    return;
  }

  try {
    const typeLabel =
      feedback.type === 'praise'
        ? 'Praise'
        : feedback.type === 'bug'
        ? 'Bug Report'
        : feedback.type === 'feature-request'
        ? 'Feature Request'
        : 'Feedback';

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.FEEDBACK_EMAIL_TO,
      subject: `New ${typeLabel} Submission - Watcha Bringin`,
      html: `
        <h2>New Feedback Submission</h2>
        <p><strong>Type:</strong> ${typeLabel}</p>
        <p><strong>From:</strong> ${feedback.email}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${feedback.message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated email from the Watcha Bringin feedback form.</p>
      `,
      text: `
New Feedback Submission

Type: ${typeLabel}
From: ${feedback.email}

Message:
${feedback.message}
      `,
    });

    console.log('Feedback email sent successfully');
  } catch (error) {
    console.error('Error sending feedback email:', error);
    // Don't throw - we don't want email failures to break feedback submission
  }
}

