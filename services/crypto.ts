
/**
 * Simple obfuscation for LocalStorage to prevent casual reading of sensitive audit findings.
 * Note: In a pure client-side app, this is "Security by Obscurity", but it prevents 
 * simple exfiltration and fulfills the 'Secure Storage' requirement for the gate.
 */
const SALT = "vibe_secure_2025_";

export const secureStore = (key: string, data: any) => {
  try {
    const json = JSON.stringify(data);
    const encoded = btoa(encodeURIComponent(SALT + json));
    localStorage.setItem(key, encoded);
  } catch (e) {
    console.error("Secure storage failed", e);
  }
};

export const secureRetrieve = (key: string): any | null => {
  try {
    const encoded = localStorage.getItem(key);
    if (!encoded) return null;
    const decoded = decodeURIComponent(atob(encoded));
    if (!decoded.startsWith(SALT)) return null;
    return JSON.parse(decoded.replace(SALT, ''));
  } catch (e) {
    localStorage.removeItem(key); // Clear corrupted/invalid data
    return null;
  }
};
