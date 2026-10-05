// test/crypto-test.mjs — Test Web Crypto AES-GCM encryption & decryption
import crypto from 'node:crypto';

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

async function runTest() {
  console.log('Testing AES-GCM encryption...');
  const key = crypto.randomBytes(32).toString('base64');
  const sampleData = JSON.stringify({ username: 'kkn_desa_sukamaju@gmail.com', password: 'SuperSecretPassword123!' });

  const encrypted = await encryptSecret(sampleData, key);
  console.log('Encrypted payload (base64):', encrypted);

  const decrypted = await decryptSecret(encrypted, key);
  console.log('Decrypted result:', decrypted);

  if (decrypted === sampleData) {
    console.log('✅ TEST PASSED: Decrypted payload matches original data perfectly!');
  } else {
    console.error('❌ TEST FAILED: Decrypted payload does not match!');
    process.exit(1);
  }
}

runTest();
