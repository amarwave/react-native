// Pure JS SHA-256 + HMAC — no WebCrypto dependency (React Native safe)

// ── SHA-256 ───────────────────────────────────────────────────────────────────

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr32(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

function sha256Block(H: Uint32Array, W: Uint32Array, block: Uint8Array, offset: number): void {
  for (let i = 0; i < 16; i++) {
    W[i] =
      (block[offset + i * 4]     << 24) |
      (block[offset + i * 4 + 1] << 16) |
      (block[offset + i * 4 + 2] <<  8) |
       block[offset + i * 4 + 3];
  }
  for (let i = 16; i < 64; i++) {
    const s0 = rotr32(W[i - 15], 7) ^ rotr32(W[i - 15], 18) ^ (W[i - 15] >>> 3);
    const s1 = rotr32(W[i - 2], 17) ^ rotr32(W[i - 2], 19)  ^ (W[i - 2]  >>> 10);
    W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
  }

  let [a, b, c, d, e, f, g, h] = [H[0], H[1], H[2], H[3], H[4], H[5], H[6], H[7]];

  for (let i = 0; i < 64; i++) {
    const S1  = rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25);
    const ch  = (e & f) ^ (~e & g);
    const tmp1 = (h + S1 + ch + K[i] + W[i]) | 0;
    const S0  = rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22);
    const maj = (a & b) ^ (a & c) ^ (b & c);
    const tmp2 = (S0 + maj) | 0;
    h = g; g = f; f = e; e = (d + tmp1) | 0;
    d = c; c = b; b = a; a = (tmp1 + tmp2) | 0;
  }

  H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0;
  H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
  H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0;
  H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
}

function sha256(data: Uint8Array): Uint8Array {
  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const W    = new Uint32Array(64);
  const len  = data.length;
  const bits = len * 8;

  // Pad: append 0x80, then zeros, then 64-bit big-endian length
  const padLen = ((len + 9 + 63) & ~63);
  const padded = new Uint8Array(padLen);
  padded.set(data);
  padded[len] = 0x80;
  // Write 64-bit length as big-endian (only low 32 bits needed for sane inputs)
  const dv = new DataView(padded.buffer);
  dv.setUint32(padLen - 4, bits >>> 0,  false);
  dv.setUint32(padLen - 8, Math.floor(bits / 0x100000000), false);

  for (let i = 0; i < padLen; i += 64) {
    sha256Block(H, W, padded, i);
  }

  const out = new Uint8Array(32);
  const ov  = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) ov.setUint32(i * 4, H[i] >>> 0, false);
  return out;
}

// ── Encoder shim ──────────────────────────────────────────────────────────────

function encode(str: string): Uint8Array {
  // React Native ships with TextEncoder on Hermes, but polyfill just in case
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else {
      out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
  }
  return new Uint8Array(out);
}

// ── HMAC-SHA256 ───────────────────────────────────────────────────────────────

function xor(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
  return out;
}

function hmacSHA256Raw(secret: Uint8Array, message: Uint8Array): Uint8Array {
  let key = secret.length > 64 ? sha256(secret) : secret;
  if (key.length < 64) {
    const padded = new Uint8Array(64);
    padded.set(key);
    key = padded;
  }
  const opad = xor(key, new Uint8Array(64).fill(0x5c));
  const ipad = xor(key, new Uint8Array(64).fill(0x36));
  const inner = new Uint8Array(64 + message.length);
  inner.set(ipad); inner.set(message, 64);
  const outer = new Uint8Array(64 + 32);
  outer.set(opad); outer.set(sha256(inner), 64);
  return sha256(outer);
}

/** Compute HMAC-SHA256 and return as lowercase hex string. Pure JS — no WebCrypto. */
export async function hmacSHA256(secret: string, message: string): Promise<string> {
  const raw = hmacSHA256Raw(encode(secret), encode(message));
  return Array.from(raw).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Generate a short random ID string. */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10) +
         Math.random().toString(36).slice(2, 10);
}
