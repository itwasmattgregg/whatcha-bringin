import twilio from 'twilio';

if (
  !process.env.TWILIO_ACCOUNT_SID ||
  !process.env.TWILIO_AUTH_TOKEN ||
  !process.env.TWILIO_VERIFY_SERVICE_SID
) {
  throw new Error(
    'Twilio credentials are missing. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID to .env.local'
  );
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

/**
 * Normalize phone number to E.164 format required by Twilio Verify
 * @param phoneNumber - Phone number in various formats
 * @returns Phone number in E.164 format (e.g., +16129875559)
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // If it already starts with +, return as is (assuming it's already E.164)
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If it's a 10-digit US number, add +1
  if (/^\d{10}$/.test(cleaned)) {
    return `+1${cleaned}`;
  }

  // If it's an 11-digit number starting with 1, add +
  if (/^1\d{10}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // If it's already 11+ digits without +, assume it needs +
  if (/^\d{11,}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // Return as is if we can't determine format
  return cleaned;
}

/**
 * Send verification code using Twilio Verify API
 * @param phoneNumber - Phone number in E.164 format (e.g., +15551234567)
 * @returns Verification SID
 */
export async function sendVerificationCode(
  phoneNumber: string
): Promise<string> {
  if (!verifyServiceSid) {
    throw new Error('TWILIO_VERIFY_SERVICE_SID is not set');
  }

  // Normalize phone number to E.164 format
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  console.log(
    `Sending verification code to ${normalizedPhone} (normalized from ${phoneNumber}) via Twilio Verify`
  );

  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: normalizedPhone,
        channel: 'sms',
      });

    console.log(
      `Verification sent successfully. SID: ${verification.sid}, Status: ${verification.status}`
    );
    return verification.sid;
  } catch (error) {
    const twilioError = error as {
      code?: number;
      message?: string;
      status?: number;
      moreInfo?: string;
    };
    console.error('Twilio Verify error details:', {
      code: twilioError.code,
      message: twilioError.message,
      status: twilioError.status,
      moreInfo: twilioError.moreInfo,
    });
    throw error;
  }
}

/**
 * Verify code using Twilio Verify API
 * @param phoneNumber - Phone number in E.164 format
 * @param code - 6-digit verification code
 * @returns true if verification is successful
 */
export async function verifyCode(
  phoneNumber: string,
  code: string
): Promise<boolean> {
  if (!verifyServiceSid) {
    throw new Error('TWILIO_VERIFY_SERVICE_SID is not set');
  }

  // Normalize phone number to E.164 format (must match the number used in sendVerificationCode)
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  console.log(
    `Verifying code for ${normalizedPhone} (normalized from ${phoneNumber})`
  );

  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: normalizedPhone,
        code: code,
      });

    console.log(
      `Verification check result. SID: ${verificationCheck.sid}, Status: ${verificationCheck.status}`
    );

    return verificationCheck.status === 'approved';
  } catch (error) {
    const twilioError = error as {
      code?: number;
      message?: string;
      status?: number;
    };
    console.error('Twilio Verify check error:', {
      code: twilioError.code,
      message: twilioError.message,
      status: twilioError.status,
    });
    throw error;
  }
}

/**
 * Send SMS using Twilio Messages API (for invites, not verification)
 * @param to - Phone number (will be normalized to E.164 format)
 * @param message - Message text
 */
export async function sendSMS(to: string, message: string): Promise<void> {
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!fromNumber) {
    throw new Error('TWILIO_PHONE_NUMBER is not set');
  }

  // Normalize phone number to E.164 format
  const normalizedTo = normalizePhoneNumber(to);
  console.log(`Attempting to send SMS from ${fromNumber} to ${normalizedTo}`);

  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: normalizedTo,
    });
    console.log(`SMS sent successfully. SID: ${result.sid}`);
  } catch (error) {
    const twilioError = error as {
      code?: number;
      message?: string;
      status?: number;
      moreInfo?: string;
    };
    console.error('Twilio error details:', {
      code: twilioError.code,
      message: twilioError.message,
      status: twilioError.status,
      moreInfo: twilioError.moreInfo,
    });
    throw error;
  }
}

/**
 * Generate a random 6-digit code (for invite codes, not verification)
 * @returns 6-digit code as string
 */
export function generateMagicCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default client;
