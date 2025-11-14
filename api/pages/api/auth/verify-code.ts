import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { verifyCode, normalizePhoneNumber } from '../../../lib/twilio';
import { generateToken } from '../../../lib/auth';
import { UserCollection } from '../../../models/User';
import { z } from 'zod';

const verifyCodeSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, code } = verifyCodeSchema.parse(req.body);
    const db = await getDb();
    
    // Normalize phone number to match the format used when sending the code
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    
    // Development mode: Allow test code "123456" for test phone numbers (numbers starting with +1555)
    const isTestNumber = normalizedPhone.startsWith('+1555');
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTestCode = code === '123456';
    
    let isVerified = false;
    
    if (isDevelopment && isTestNumber && isTestCode) {
      console.log(`[DEV MODE] Test code accepted for test number ${normalizedPhone}`);
      isVerified = true;
    } else {
      // Verify code using Twilio Verify API (uses normalized phone internally)
      try {
        isVerified = await verifyCode(normalizedPhone, code);
      } catch (verifyError) {
        const twilioError = verifyError as { code?: number; message?: string; status?: number };
        console.error('Twilio Verify check error:', twilioError);
        
        // Handle specific Twilio error codes
        if (twilioError.code === 60200) {
          return res.status(400).json({ error: 'Invalid phone number format' });
        } else if (twilioError.code === 60202) {
          return res.status(429).json({ error: 'Too many verification attempts. Please request a new code.' });
        } else if (twilioError.code === 20429) {
          return res.status(429).json({ error: 'Too many requests. Please try again later.' });
        }
        
        // For other errors, treat as invalid code
        return res.status(401).json({ error: 'Invalid or expired verification code' });
      }
    }
    
    if (!isVerified) {
      return res.status(401).json({ error: 'Invalid or expired verification code' });
    }
    
    // Get or create user (use normalized phone number for consistency)
    let user = await db.collection(UserCollection).findOne({ phoneNumber: normalizedPhone });
    
    if (!user) {
      const result = await db.collection(UserCollection).insertOne({
        phoneNumber: normalizedPhone,
        createdAt: new Date(),
      });
      user = await db.collection(UserCollection).findOne({ _id: result.insertedId });
    }
    
    // Generate token
    const token = generateToken(user!._id.toString());
    
    return res.status(200).json({
      token,
      user: {
        _id: user!._id.toString(),
        phoneNumber: user!.phoneNumber,
        name: user!.name,
        createdAt: user!.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.issues });
    }
    console.error('Error verifying code:', error);
    return res.status(500).json({ error: 'Failed to verify code' });
  }
}

