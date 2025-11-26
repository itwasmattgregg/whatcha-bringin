import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import {
  sendVerificationCode,
  normalizePhoneNumber,
} from '../../../lib/twilio';
import { UserCollection } from '../../../models/User';
import { z } from 'zod';

const sendCodeSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber } = sendCodeSchema.parse(req.body);
    const db = await getDb();

    // Normalize phone number for consistent storage and Twilio Verify
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Check if user exists, create if not (store normalized phone number)
    const user = await db
      .collection(UserCollection)
      .findOne({ phoneNumber: normalizedPhone });

    if (!user) {
      await db.collection(UserCollection).insertOne({
        phoneNumber: normalizedPhone,
        createdAt: new Date(),
      });
    }

    // Production test account (for app store reviewers)
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER;
    const isTestAccount =
      testPhoneNumber &&
      normalizedPhone === normalizePhoneNumber(testPhoneNumber);

    // Development mode: Skip sending SMS for test phone numbers (numbers starting with +1555)
    const isDevTestNumber = normalizedPhone.startsWith('+1555');
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isTestAccount) {
      console.log(
        `[TEST ACCOUNT] Skipping SMS for test account ${normalizedPhone}. Use configured test code to verify.`
      );
      return res.status(200).json({
        success: true,
        message: 'Verification code sent (test account)',
        testAccount: true,
      });
    }

    if (isDevelopment && isDevTestNumber) {
      console.log(
        `[DEV MODE] Skipping SMS for test number ${normalizedPhone}. Use code "123456" to verify.`
      );
      return res.status(200).json({
        success: true,
        message: 'Verification code sent (dev mode - use code 123456)',
        devMode: true,
      });
    }

    // Send verification code via Twilio Verify (uses normalized phone internally)
    try {
      const verificationSid = await sendVerificationCode(normalizedPhone);
      console.log(
        `Verification code sent to ${normalizedPhone}. Verification SID: ${verificationSid}`
      );

      return res.status(200).json({
        success: true,
        message: 'Verification code sent',
        verificationSid, // Optional: return SID for debugging
      });
    } catch (verifyError) {
      const twilioError =
        typeof verifyError === 'object' && verifyError !== null
          ? (verifyError as { code?: number; message?: string })
          : undefined;

      console.error('Failed to send verification code:', verifyError);

      // Return appropriate error based on Twilio error code
      if (twilioError?.code === 60200) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      } else if (twilioError?.code === 60203) {
        return res
          .status(429)
          .json({ error: 'Too many attempts. Please try again later.' });
      } else {
        return res.status(500).json({
          error: 'Failed to send verification code',
          details:
            process.env.NODE_ENV === 'development'
              ? twilioError?.message
              : undefined,
        });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: 'Invalid request', details: error.issues });
    }
    console.error('Error sending verification code:', error);
    return res.status(500).json({ error: 'Failed to send verification code' });
  }
}
