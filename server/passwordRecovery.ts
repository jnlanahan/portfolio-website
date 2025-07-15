import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Password Recovery Service
 * Provides secure password recovery functionality using environment variables
 */

interface RecoveryAttempt {
  timestamp: number;
  ip: string;
  userAgent: string;
}

// In-memory storage for recovery attempts (resets on server restart)
const recoveryAttempts: RecoveryAttempt[] = [];

// Rate limiting: Max 3 recovery attempts per hour
const MAX_RECOVERY_ATTEMPTS = 3;
const RECOVERY_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function generateRecoveryKey(): string {
  // Generate a secure 32-character recovery key
  return crypto.randomBytes(16).toString('hex');
}

export async function hashRecoveryKey(recoveryKey: string): Promise<string> {
  return await bcrypt.hash(recoveryKey, 12);
}

export async function verifyRecoveryKey(recoveryKey: string, hashedKey: string): Promise<boolean> {
  return await bcrypt.compare(recoveryKey, hashedKey);
}

export function checkRecoveryRateLimit(ip: string): boolean {
  const now = Date.now();
  const recentAttempts = recoveryAttempts.filter(
    attempt => attempt.ip === ip && (now - attempt.timestamp) < RECOVERY_WINDOW_MS
  );
  
  return recentAttempts.length < MAX_RECOVERY_ATTEMPTS;
}

export function recordRecoveryAttempt(ip: string, userAgent: string): void {
  recoveryAttempts.push({
    timestamp: Date.now(),
    ip,
    userAgent
  });
  
  // Clean up old attempts
  const cutoff = Date.now() - RECOVERY_WINDOW_MS;
  const index = recoveryAttempts.findIndex(attempt => attempt.timestamp >= cutoff);
  if (index > 0) {
    recoveryAttempts.splice(0, index);
  }
}

export async function initiatePasswordReset(newPassword: string): Promise<string> {
  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  // Generate instructions for updating the environment variable
  const instructions = `
=== PASSWORD RECOVERY INSTRUCTIONS ===

Your new password has been hashed. To complete the password reset:

1. Go to your Replit Secrets panel
2. Update the ADMIN_PASSWORD secret with this new hashed value:
   ${hashedPassword}

3. Restart your application

Your new password will be: ${newPassword}

IMPORTANT: Save this password securely. The original password is no longer valid.
`;

  console.log(instructions);
  return hashedPassword;
}

export function getRecoveryInstructions(): string {
  return `
=== ADMIN PASSWORD RECOVERY ===

If you've forgotten your admin password, you have two options:

OPTION 1: Manual Recovery (Recommended)
1. Go to your Replit Secrets panel
2. Generate a new password
3. Use the password hashing script: node scripts/hash-password.js [your-new-password]
4. Update ADMIN_PASSWORD secret with the hashed value
5. Restart your application

OPTION 2: Emergency Recovery Key
If you have your recovery key, you can use the /api/admin/recover endpoint.

OPTION 3: Reset Everything
1. Delete the ADMIN_PASSWORD secret
2. Delete the ADMIN_USERNAME secret
3. Re-run the secret setup process

For maximum security, it's recommended to use Option 1.
`;
}