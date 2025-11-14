/**
 * Verify Google reCAPTCHA v3 token
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  // Always allow dev-token (development fallback when reCAPTCHA fails to load)
  if (token === 'dev-token') {
    console.warn('Allowing dev-token without reCAPTCHA verification (fallback mode).');
    return true;
  }

  if (!process.env.RECAPTCHA_SECRET_KEY) {
    // If reCAPTCHA is not configured, allow all tokens (development mode)
    console.warn('reCAPTCHA not configured. Allowing submission without verification.');
    return true;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET_KEY)}&response=${encodeURIComponent(token)}`,
    });

    if (!response.ok) {
      console.error('reCAPTCHA API error:', response.status, response.statusText);
      return false;
    }

    const data = await response.json();

    console.log('reCAPTCHA verification result:', {
      success: data.success,
      score: data.score,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
    });

    // reCAPTCHA v3 returns a score from 0.0 to 1.0
    // 1.0 is very likely a human, 0.0 is very likely a bot
    // We'll accept scores >= 0.5
    const isValid = data.success === true && (data.score || 0) >= 0.5;
    
    if (!isValid) {
      console.warn('reCAPTCHA verification failed:', {
        success: data.success,
        score: data.score,
        'error-codes': data['error-codes'],
      });
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return false;
  }
}

