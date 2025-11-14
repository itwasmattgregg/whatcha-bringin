import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/db';
import { FeedbackCollection } from '../../models/Feedback';
import { verifyRecaptcha } from '../../lib/recaptcha';
import { sendFeedbackEmail } from '../../lib/email';
import { z } from 'zod';
import { createGithubIssue } from '../../lib/github';

const feedbackSchema = z.object({
  email: z.string().email('Invalid email address'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long'),
  type: z.enum(['praise', 'bug', 'feature-request', 'other']).optional(),
  recaptchaToken: z.string().min(1, 'reCAPTCHA token is required'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS for public feedback endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, message, type, recaptchaToken } = feedbackSchema.parse(
      req.body
    );

    console.log('Feedback submission received:', {
      email,
      type,
      messageLength: message.length,
      hasToken: !!recaptchaToken,
    });

    // Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      console.error('reCAPTCHA verification failed for feedback submission');
      return res
        .status(400)
        .json({ error: 'reCAPTCHA verification failed. Please try again.' });
    }

    const db = await getDb();

    // Get IP address and user agent for spam detection
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Save feedback to database
    const result = await db.collection(FeedbackCollection).insertOne({
      email,
      message,
      type: type || 'other',
      createdAt: new Date(),
      ipAddress,
      userAgent,
    });

    // Send email notification (don't await - fire and forget)
    sendFeedbackEmail({ email, message, type }).catch((error) => {
      console.error('Failed to send feedback email:', error);
    });

    const normalizedType = type || 'other';
    if (normalizedType === 'bug' || normalizedType === 'feature-request') {
      const issueBody = `${message}\n\n---\nReporter email: ${email}\nType: ${normalizedType}`;
      const isBug = normalizedType === 'bug';
      const issueOptions = {
        labels: ['support-form', isBug ? 'bug' : 'feature-request'],
        titlePrefix: isBug ? 'Bug' : 'Feature request',
      };
      createGithubIssue(message, issueBody, issueOptions).catch((err) => {
        console.error(
          `Failed to open GitHub issue for ${normalizedType} feedback:`,
          err
        );
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
      id: result.insertedId.toString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: 'Invalid request', details: error.issues });
    }
    console.error('Error submitting feedback:', error);
    return res
      .status(500)
      .json({ error: 'Failed to submit feedback. Please try again later.' });
  }
}
