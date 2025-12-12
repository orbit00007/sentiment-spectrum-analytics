// Password encryption utility
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
const SALT = import.meta.env.VITE_SALT;

export const encryptPassword = (password: string): string => {
  try {
    // Create key from encryption key and salt
    const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, SALT, {
      keySize: 256 / 32,
      iterations: 1000
    });
    
    // Encrypt the password
    const encrypted = CryptoJS.AES.encrypt(password, key.toString()).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
};
