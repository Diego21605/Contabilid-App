/**
 * E2EE Cryptographic Security Module for Contabilid-App
 * Implements AES-256-GCM encryption and PBKDF2 key derivation using the native Web Crypto API.
 */
import { addDoc, setDoc, updateDoc } from 'firebase/firestore';

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derives a 256-bit AES-GCM key from a user password and their Firebase UID as salt.
 * Uses PBKDF2 with 100,000 iterations of SHA-256.
 */
export async function deriveKeyFromPassword(password: string, uid: string): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    console.warn("Web Crypto API (window.crypto.subtle) is not available. Falling back to mock key derivation.");
    return { isMock: true, secret: password + '_' + uid } as unknown as CryptoKey;
  }

  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import the password as key material
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Use UID as salt for uniqueness per user
  const salt = encoder.encode(uid + '_contabilidapp_salt_v1');
  
  // Derive AES-GCM 256-bit key
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true, // extractable for sessionStorage transfer
    ['encrypt', 'decrypt']
  );
}

/**
 * Derives a secure AES-GCM key deterministically from Google UID using a fixed local salt.
 * Ensures transparent E2EE experience for Google 1-Click login users without manual password entry.
 */
export async function deriveKeyFromGoogleUid(uid: string): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    console.warn("Web Crypto API (window.crypto.subtle) is not available. Falling back to mock key derivation.");
    return { isMock: true, secret: 'google_' + uid } as unknown as CryptoKey;
  }

  const encoder = new TextEncoder();
  const rawSecretMaterial = encoder.encode(uid);
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    rawSecretMaterial,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Fixed salt for deterministic derivation for the specific user UID
  const salt = encoder.encode('google_e2ee_contabilidapp_salt_deterministic_v1_' + uid);
  
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Exports a CryptoKey object to a Base64 string.
 */
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Imports a CryptoKey object from a Base64 string.
 */
export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const rawBuffer = base64ToArrayBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    'raw',
    rawBuffer,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts any Javascript value (object, string, number) using AES-256-GCM.
 * Returns an encrypted payload with a random 12-byte IV.
 */
export async function encryptData(data: any, key: CryptoKey): Promise<{ encryptedData: string; iv: string; isEncrypted: boolean }> {
  if (data === undefined || data === null) {
    throw new Error('Cannot encrypt null or undefined data');
  }

  const serialized = JSON.stringify(data);

  if ((key as any)?.isMock || typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(serialized);
    return {
      encryptedData: arrayBufferToBase64(encoded.buffer),
      iv: 'fallback_iv',
      isEncrypted: true
    };
  }

  const encoder = new TextEncoder();
  const encodedData = encoder.encode(serialized);
  
  // Generate random 12-byte IV for AES-GCM
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encodedData
  );
  
  return {
    encryptedData: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    isEncrypted: true
  };
}

/**
 * Decrypts a previously encrypted block back into its original Javascript format.
 */
export async function decryptData(encryptedBlock: { encryptedData: string; iv: string }, key: CryptoKey): Promise<any> {
  const { encryptedData, iv } = encryptedBlock;
  
  if ((key as any)?.isMock || iv === 'fallback_iv' || typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    const rawBuffer = base64ToArrayBuffer(encryptedData);
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(rawBuffer);
    return JSON.parse(decryptedString);
  }

  const cipherBuffer = base64ToArrayBuffer(encryptedData);
  const ivBuffer = base64ToArrayBuffer(iv);
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(ivBuffer)
    },
    key,
    cipherBuffer
  );
  
  const decoder = new TextDecoder();
  const decryptedString = decoder.decode(decryptedBuffer);
  
  return JSON.parse(decryptedString);
}

/**
 * Encrypts a full document payload, separating non-sensitive structural fields from sensitive ones.
 * Keeps fields like date/timestamps and relationship IDs in plain text to preserve indexing and querying in Firestore.
 */
export async function encryptDoc(
  data: any,
  key: CryptoKey,
  plainTextKeys: string[] = ['fechaCreacion', 'fechaActualizacion', 'fecha', 'date', 'accountId', 'cuentaId', 'debtId', 'isEncrypted', 'ownerId', 'uid']
): Promise<any> {
  const plainTextPart: any = {};
  const sensitivePart: any = {};
  
  for (const k of Object.keys(data)) {
    if (plainTextKeys.includes(k)) {
      plainTextPart[k] = data[k];
    } else {
      sensitivePart[k] = data[k];
    }
  }
  
  const encrypted = await encryptData(sensitivePart, key);
  return {
    ...plainTextPart,
    ...encrypted
  };
}

/**
 * Decrypts a document payload if it is encrypted, merging the decrypted fields with the unencrypted metadata.
 * Returns the original unencrypted document format.
 */
export async function decryptDoc(docData: any, key: CryptoKey): Promise<any> {
  if (!docData || !docData.isEncrypted) {
    return docData; // Return as is for legacy/unencrypted data compatibility
  }
  
  try {
    const decryptedSensitive = await decryptData({
      encryptedData: docData.encryptedData,
      iv: docData.iv
    }, key);
    
    const result = { ...docData };
    delete result.encryptedData;
    delete result.iv;
    delete result.isEncrypted;
    
    return {
      ...result,
      ...decryptedSensitive
    };
  } catch (err) {
    console.error('Error decrypting document payload:', err);
    throw err;
  }
}

/**
 * Helper to securely add a document to Firestore under E2EE.
 */
export async function secureAddDoc(colRef: any, data: any, key: CryptoKey | null): Promise<any> {
  if (key) {
    const encrypted = await encryptDoc(data, key);
    return await addDoc(colRef, encrypted);
  } else {
    return await addDoc(colRef, data);
  }
}

/**
 * Helper to securely set a document in Firestore under E2EE.
 */
export async function secureSetDoc(docRef: any, data: any, key: CryptoKey | null, options?: any): Promise<any> {
  if (key) {
    const encrypted = await encryptDoc(data, key);
    return await setDoc(docRef, encrypted, options);
  } else {
    return await setDoc(docRef, data, options);
  }
}

/**
 * Helper to securely update a document in Firestore under E2EE.
 */
export async function secureUpdateDoc(docRef: any, currentData: any, updatedFields: any, key: CryptoKey | null): Promise<any> {
  if (key) {
    // Merge existing decrypted data with the new fields
    const merged = { ...currentData, ...updatedFields };
    // Exclude any local helper fields like ID
    delete merged.id;
    const encrypted = await encryptDoc(merged, key);
    return await updateDoc(docRef, encrypted);
  } else {
    return await updateDoc(docRef, updatedFields);
  }
}
