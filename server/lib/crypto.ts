// server/lib/crypto.ts — Enkripsi dan dekripsi AES-GCM 256 bit via Web Crypto
// Sesuai PRD bagian 10.3: IV acak 12 byte, simpan base64(iv + ciphertext)

const ALGO = 'AES-GCM';
const IV_LENGTH = 12;

/** Import kunci AES dari base64 string */
async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', raw, { name: ALGO }, false, ['encrypt', 'decrypt']);
}

/** Enkripsi JSON menjadi base64(iv + ciphertext) */
export async function encryptSecret(plainJson: string, base64Key: string): Promise<string> {
  const key = await importKey(base64Key);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plainJson);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded);

  // Gabungkan iv + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/** Dekripsi base64(iv + ciphertext) menjadi plaintext JSON */
export async function decryptSecret(payload: string, base64Key: string): Promise<string> {
  const key = await importKey(base64Key);
  const combined = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));

  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt({ name: ALGO, iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}
