/**
 * Admin Seed Script
 * Usage: node scripts/seed-admin.mjs
 *
 * Creates an initial admin account directly in the database.
 * Run this once from your terminal. Never expose this script publicly.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// ── Config ────────────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\n❌  MONGODB_URI is not set.\n    Run: MONGODB_URI=<your-uri> node scripts/seed-admin.mjs\n');
  process.exit(1);
}

// ── Schema (mirrors lib/models/User.ts) ───────────────────────────────────────

const UserSchema = new mongoose.Schema({
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:      { type: String, required: true },
  firstName:     { type: String, required: true },
  lastName:      { type: String, required: true },
  role:          { type: String, enum: ['admin', 'student'], default: 'student', required: true },
  emailVerified: { type: Boolean, default: false },
  createdAt:     { type: Date, default: Date.now },
  updatedAt:     { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// ── Helpers ───────────────────────────────────────────────────────────────────

function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const rl = readline.createInterface({ input, output });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Visual Crafter Solutions — Admin Seed');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const firstName = await rl.question('First name : ');
  const lastName  = await rl.question('Last name  : ');
  const email     = await rl.question('Email      : ');
  const password  = await rl.question('Password   : ');

  rl.close();

  // Basic validation
  if (!firstName.trim() || !lastName.trim()) {
    console.error('\n❌  First and last name are required.\n');
    process.exit(1);
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    console.error('\n❌  Invalid email address.\n');
    process.exit(1);
  }

  if (!validatePassword(password)) {
    console.error('\n❌  Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&).\n');
    process.exit(1);
  }

  // Connect
  console.log('\n⏳  Connecting to database…');
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connected.\n');

  // Check for duplicate
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.error(`❌  A user with email "${email}" already exists (role: ${existing.role}).\n`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // Hash & create
  const salt           = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.create({
    firstName:     firstName.trim(),
    lastName:      lastName.trim(),
    email:         email.toLowerCase(),
    password:      hashedPassword,
    role:          'admin',
    emailVerified: true,   // admins are pre-verified
  });

  console.log(`✅  Admin account created successfully.`);
  console.log(`    Name  : ${firstName.trim()} ${lastName.trim()}`);
  console.log(`    Email : ${email.toLowerCase()}`);
  console.log(`    Role  : admin\n`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌  Unexpected error:', err.message, '\n');
  process.exit(1);
});
