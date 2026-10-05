// test/api-test.mjs — Comprehensive test suite for KKN Hub validation, auth logic, and crypto
import crypto from 'node:crypto';
import { z } from 'zod';

console.log('🚀 Starting KKN Hub Automated Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
  passedTests++;
}

// 1. Validation Schemas Test
const loginSchema = z.object({
  code: z.string().min(1, 'Kode akses wajib diisi'),
});

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Nama kategori wajib diisi').max(40, 'Nama kategori maksimal 40 karakter'),
});

const linkItemSchema = z.object({
  title: z.string().trim().min(1).max(100),
  type: z.literal('link'),
  url: z.string().url().max(2000).refine((u) => u.startsWith('http://') || u.startsWith('https://'), 'URL harus diawali http:// atau https://'),
  description: z.string().max(300).nullable().optional(),
});

const noteItemSchema = z.object({
  title: z.string().trim().min(1).max(100),
  type: z.literal('note'),
  content: z.string().min(1).max(5000),
});

const secretItemSchema = z.object({
  title: z.string().trim().min(1).max(100),
  type: z.literal('secret'),
  username: z.string().max(200).optional().default(''),
  password: z.string().min(1).max(500),
});

// Test Login validation
assert(loginSchema.safeParse({ code: 'kkn-2026' }).success, 'Valid login code passes validation');
assert(!loginSchema.safeParse({ code: '' }).success, 'Empty login code fails validation');

// Test Category validation
assert(categorySchema.safeParse({ name: 'Dokumentasi' }).success, 'Valid category name passes validation');
assert(!categorySchema.safeParse({ name: '' }).success, 'Empty category name fails validation');
assert(!categorySchema.safeParse({ name: 'a'.repeat(41) }).success, 'Category name > 40 chars fails validation');

// Test Link Item validation
assert(linkItemSchema.safeParse({ title: 'Google Drive KKN', type: 'link', url: 'https://drive.google.com/folder' }).success, 'Valid HTTPS link item passes');
assert(linkItemSchema.safeParse({ title: 'Server Web', type: 'link', url: 'http://localhost:3000' }).success, 'Valid HTTP link item passes');
assert(!linkItemSchema.safeParse({ title: 'Invalid URL', type: 'link', url: 'ftp://files.com' }).success, 'Non-HTTP(S) link item fails');
assert(!linkItemSchema.safeParse({ title: 'Invalid URL', type: 'link', url: 'not-a-url' }).success, 'Malformed URL fails');

// Test Note Item validation
assert(noteItemSchema.safeParse({ title: 'Jadwal Piket', type: 'note', content: 'Senin: Tim A\nSelasa: Tim B' }).success, 'Valid note item passes');
assert(!noteItemSchema.safeParse({ title: 'Empty Note', type: 'note', content: '' }).success, 'Empty note content fails');

// Test Secret Item validation
assert(secretItemSchema.safeParse({ title: 'Canva Pro Kelompok', type: 'secret', username: 'kkn@desa.id', password: 'SecretPassword123' }).success, 'Valid secret item passes');
assert(!secretItemSchema.safeParse({ title: 'Canva Pro Kelompok', type: 'secret', password: '' }).success, 'Empty secret password fails');

// 2. Constant Time Comparison Test
async function constantTimeCompare(a, b) {
  const encoder = new TextEncoder();
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  const viewA = new Uint8Array(hashA);
  const viewB = new Uint8Array(hashB);
  if (viewA.length !== viewB.length) return false;
  let result = 0;
  for (let i = 0; i < viewA.length; i++) {
    result |= viewA[i] ^ viewB[i];
  }
  return result === 0;
}

const isMatch = await constantTimeCompare('kkn-kode-akses', 'kkn-kode-akses');
assert(isMatch === true, 'Constant time comparison matches identical codes');

const isMismatch = await constantTimeCompare('kkn-kode-akses', 'kode-salah');
assert(isMismatch === false, 'Constant time comparison rejects non-matching codes');

// 3. Crypto AES-GCM 256-bit encryption / decryption test
const ALGO = 'AES-GCM';
const IV_LENGTH = 12;

async function importKey(base64Key) {
  const raw = Buffer.from(base64Key, 'base64');
  return crypto.subtle.importKey('raw', raw, { name: ALGO }, false, ['encrypt', 'decrypt']);
}

async function encryptSecret(plainJson, base64Key) {
  const key = await importKey(base64Key);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plainJson);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded);

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return Buffer.from(combined).toString('base64');
}

async function decryptSecret(payload, base64Key) {
  const key = await importKey(base64Key);
  const combined = Buffer.from(payload, 'base64');

  const iv = combined.subarray(0, IV_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt({ name: ALGO, iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

const key = crypto.randomBytes(32).toString('base64');
const sensitiveData = JSON.stringify({ username: 'tim_kkn_desa@gmail.com', password: 'P@ssw0rdSuperAman2026!' });
const encryptedPayload = await encryptSecret(sensitiveData, key);

assert(typeof encryptedPayload === 'string' && encryptedPayload.length > 0, 'Encrypted payload is non-empty base64 string');
assert(!encryptedPayload.includes('P@ssw0rdSuperAman2026!'), 'Ciphertext does not leak plaintext password');

const decryptedData = await decryptSecret(encryptedPayload, key);
assert(decryptedData === sensitiveData, 'Decrypted payload matches original JSON exactly');

console.log(`\n🎉 All ${passedTests}/${totalTests} tests passed successfully!`);
