#!/usr/bin/env node

/**
 * Password Hashing Utility
 * This script hashes the admin password using bcrypt
 * Usage: node scripts/hash-password.js [password]
 */

const bcrypt = require('bcrypt');

async function hashPassword(password) {
  try {
    const saltRounds = 12; // High security level
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
}

async function main() {
  const password = process.argv[2] || process.env.ADMIN_PASSWORD;
  
  if (!password) {
    console.error('Please provide a password as an argument or set ADMIN_PASSWORD environment variable');
    process.exit(1);
  }
  
  try {
    const hashedPassword = await hashPassword(password);
    console.log('\n=== PASSWORD HASHING COMPLETE ===');
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
    console.log('\nTo use this hashed password:');
    console.log('1. Copy the hashed password above');
    console.log('2. Go to Replit Secrets');
    console.log('3. Update ADMIN_PASSWORD with the hashed value');
    console.log('4. Restart your application');
  } catch (error) {
    console.error('Failed to hash password:', error);
    process.exit(1);
  }
}

main();