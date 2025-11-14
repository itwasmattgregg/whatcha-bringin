import crypto from 'crypto';

const INVITE_HASH_SECRET = process.env.INVITE_HASH_SECRET ?? '';

export function hashInviteCode(code: string): string {
  return crypto
    .createHash('sha256')
    .update(`${INVITE_HASH_SECRET}:${code}`)
    .digest('hex');
}


