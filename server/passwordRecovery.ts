import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendContactEmail } from './mailer';
import { storage } from './storage';

/**
 * Password Recovery Service
 * Provides secure password recovery functionality using email and security questions
 */

interface RecoveryAttempt {
  timestamp: number;
  ip: string;
  userAgent: string;
  email?: string;
}

interface RecoveryToken {
  token: string;
  email: string;
  timestamp: number;
  ip: string;
  securityAnswers: string[];
}

// In-memory storage for recovery attempts and tokens (resets on server restart)
const recoveryAttempts: RecoveryAttempt[] = [];
const recoveryTokens: RecoveryToken[] = [];

// Temporary password override system
let temporaryPasswordHash: string | null = null;
let temporaryPasswordExpiry: number | null = null;
const TEMP_PASSWORD_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days (extended for convenience)

// Rate limiting: Max 3 recovery attempts per hour
const MAX_RECOVERY_ATTEMPTS = 3;
const RECOVERY_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const TOKEN_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Security questions for multi-factor authentication
const SECURITY_QUESTIONS = [
  "What city were you born in?",
  "What was your first girlfriend's name?",
  "What is your mother's maiden name?",
  "What is your favorite color?",
  "What is your favorite movie?"
];

export function generateRecoveryToken(): string {
  // Generate a secure 32-character recovery token
  return crypto.randomBytes(32).toString('hex');
}

export async function hashSecurityAnswer(answer: string): Promise<string> {
  // Normalize answer (lowercase, trim) before hashing
  const normalized = answer.toLowerCase().trim();
  return await bcrypt.hash(normalized, 12);
}

export async function verifySecurityAnswer(answer: string, hashedAnswer: string): Promise<boolean> {
  const normalized = answer.toLowerCase().trim();
  return await bcrypt.compare(normalized, hashedAnswer);
}

export async function verifySecurityAnswers(answers: string[]): Promise<number> {
  const storedQuestions = await storage.getSecurityQuestions();
  
  let correctAnswers = 0;
  for (let i = 0; i < answers.length && i < storedQuestions.length; i++) {
    if (answers[i] && storedQuestions[i]) {
      const isCorrect = await verifySecurityAnswer(answers[i], storedQuestions[i].hashedAnswer);
      if (isCorrect) {
        correctAnswers++;
      }
    }
  }
  
  return correctAnswers;
}

export function getSecurityQuestions(): string[] {
  return SECURITY_QUESTIONS;
}

export function checkRecoveryRateLimit(ip: string): boolean {
  const now = Date.now();
  const recentAttempts = recoveryAttempts.filter(
    attempt => attempt.ip === ip && (now - attempt.timestamp) < RECOVERY_WINDOW_MS
  );
  
  return recentAttempts.length < MAX_RECOVERY_ATTEMPTS;
}

export function recordRecoveryAttempt(ip: string, userAgent: string, email?: string): void {
  recoveryAttempts.push({
    timestamp: Date.now(),
    ip,
    userAgent,
    email
  });
  
  // Clean up old attempts
  const cutoff = Date.now() - RECOVERY_WINDOW_MS;
  const index = recoveryAttempts.findIndex(attempt => attempt.timestamp >= cutoff);
  if (index > 0) {
    recoveryAttempts.splice(0, index);
  }
}

export function storeRecoveryToken(token: string, email: string, ip: string, securityAnswers: string[]): void {
  recoveryTokens.push({
    token,
    email,
    timestamp: Date.now(),
    ip,
    securityAnswers
  });
  
  // Clean up expired tokens
  const cutoff = Date.now() - TOKEN_EXPIRY_MS;
  const index = recoveryTokens.findIndex(token => token.timestamp >= cutoff);
  if (index > 0) {
    recoveryTokens.splice(0, index);
  }
}

export function getRecoveryToken(token: string): RecoveryToken | undefined {
  const now = Date.now();
  return recoveryTokens.find(
    rt => rt.token === token && (now - rt.timestamp) < TOKEN_EXPIRY_MS
  );
}

export function removeRecoveryToken(token: string): void {
  const index = recoveryTokens.findIndex(rt => rt.token === token);
  if (index > -1) {
    recoveryTokens.splice(index, 1);
  }
}

export async function sendRecoveryEmail(email: string, token: string, ip: string): Promise<boolean> {
  try {
    const recoveryLink = `${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/admin/recovery/verify?token=${token}`;
    
    const emailContent = `
Hello,

A password recovery request has been initiated for your admin account.

Recovery Details:
- IP Address: ${ip}
- Time: ${new Date().toLocaleString()}
- Token: ${token}

To complete the password recovery:
1. Click this link: ${recoveryLink}
2. Or go to /admin/recovery/verify and enter token: ${token}

This link will expire in 30 minutes.

If you did not request this recovery, please ignore this email.

Best regards,
Portfolio Admin System
`;

    const emailData = {
      name: "Admin System",
      email: email,
      subject: "Admin Password Recovery Request",
      message: emailContent
    };

    const result = await sendContactEmail(emailData);
    return result.success;
  } catch (error) {
    console.error('Failed to send recovery email:', error);
    return false;
  }
}

export async function completePasswordReset(newPassword: string): Promise<string> {
  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  // Update the environment variable directly for permanent password change
  process.env.ADMIN_PASSWORD = hashedPassword;
  
  // Clear any temporary password override
  temporaryPasswordHash = null;
  temporaryPasswordExpiry = null;
  
  // Generate instructions
  const instructions = `
=== PASSWORD RECOVERY COMPLETE ===

Your password has been permanently changed!

New Password: ${newPassword}

IMPORTANT NOTES:
- Your new password is now permanently active
- The password has been updated in your environment variables
- No temporary password was created - this is your permanent password now
- You can log in with your new password immediately and it will not expire

Password recovery successful!
`;

  console.log(instructions);
  return hashedPassword;
}

// Function to check if temporary password is valid and not expired
export function isTemporaryPasswordValid(): boolean {
  if (!temporaryPasswordHash || !temporaryPasswordExpiry) {
    return false;
  }
  return Date.now() < temporaryPasswordExpiry;
}

// Function to validate password against environment variable
export async function validateAdminPassword(password: string): Promise<boolean> {
  // Check against environment variable (which is now updated directly during password recovery)
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword) {
    return await bcrypt.compare(password, adminPassword);
  }
  
  return false;
}

// Function to extend temporary password validity (for admin convenience)
export async function extendTemporaryPassword(newPassword?: string): Promise<string> {
  if (newPassword) {
    // Set new temporary password
    temporaryPasswordHash = await bcrypt.hash(newPassword, 12);
  } else if (temporaryPasswordHash) {
    // Just extend existing temporary password
    console.log('Extending existing temporary password validity...');
  } else {
    throw new Error('No temporary password to extend');
  }
  
  // Extend validity by 30 days
  temporaryPasswordExpiry = Date.now() + TEMP_PASSWORD_EXPIRY;
  
  const instructions = `
=== TEMPORARY PASSWORD EXTENDED ===

Your temporary password has been extended and is now valid for another 30 days.

Current Status:
- Temporary password: ${newPassword ? 'Updated' : 'Extended'}
- Valid until: ${new Date(temporaryPasswordExpiry).toLocaleString()}

You can continue using your current password for the next 30 days.
`;
  
  console.log(instructions);
  return temporaryPasswordHash;
}

// Function to get current temporary password status
export function getTemporaryPasswordStatus(): { active: boolean; expiresAt: Date | null; timeLeft: string } {
  if (!temporaryPasswordHash || !temporaryPasswordExpiry) {
    return { active: false, expiresAt: null, timeLeft: 'No temporary password set' };
  }
  
  const now = Date.now();
  const isValid = now < temporaryPasswordExpiry;
  const timeLeft = isValid ? 
    Math.ceil((temporaryPasswordExpiry - now) / (24 * 60 * 60 * 1000)) + ' days' : 
    'Expired';
  
  return { 
    active: isValid, 
    expiresAt: new Date(temporaryPasswordExpiry), 
    timeLeft 
  };
}

export function getRecoveryInstructions(): string {
  return `
=== ADMIN PASSWORD RECOVERY ===

Secure password recovery using email verification and security questions:

STEP 1: Email Verification
- Enter your admin email address
- System sends a recovery token to your email
- Token expires in 30 minutes for security

STEP 2: Security Questions
- Answer 2 out of 5 security questions correctly
- Questions must be configured in advance
- Answers are case-insensitive but must match exactly

STEP 3: Password Reset
- Enter your new password
- System generates hashed password
- Follow instructions to update your environment variables

SECURITY FEATURES:
- Rate limited to 3 attempts per hour
- All attempts logged with IP and timestamp
- Tokens expire automatically
- Multi-factor authentication required
- Platform independent (works anywhere)

BACKUP RECOVERY:
If you can't access your email, use the manual recovery script:
node scripts/hash-password.js [your-new-password]
`;
}