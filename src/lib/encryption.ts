// Password encryption utility
// This matches the backend's DecryptPasswordFromFrontendSimple function

const SALT = import.meta.env.VITE_SALT;
const ENABLE_PASSWORD_ENCRYPTION = import.meta.env.VITE_ENABLE_PASSWORD_ENCRYPTION === 'true';

/**
 * Encrypts a password using simple base64 encoding with salt
 * This matches the backend's DecryptPasswordFromFrontendSimple function
 * 
 * Algorithm:
 * 1. Append salt to password: password + salt (from env VITE_SALT)
 * 2. Base64 encode the result
 * 
 * @param password - The plain text password to encrypt
 * @returns The base64 encoded password with salt
 */
export const encryptPasswordSimple = (password: string): string => {
  try {
    if (!SALT) {
      console.error('VITE_SALT environment variable is not set!');
      throw new Error('Password encryption configuration error: SALT is missing');
    }
    
    // Append salt to password
    const passwordWithSalt = password + SALT;
    
    // Base64 encode using browser's built-in btoa function
    const encrypted = btoa(passwordWithSalt);
    
    console.log('Password encrypted successfully');
    return encrypted;
  } catch (error) {
    console.error('Password encryption error:', error);
    throw error;
  }
};

/**
 * Conditionally encrypts a password based on VITE_ENABLE_PASSWORD_ENCRYPTION environment variable
 * 
 * @param password - The plain text password
 * @returns Encrypted password if encryption is enabled, plain text password otherwise
 */
export const encryptPassword = (password: string): string => {
  if (!ENABLE_PASSWORD_ENCRYPTION) {
    console.log('Password encryption is disabled (VITE_ENABLE_PASSWORD_ENCRYPTION=false)');
    return password;
  }
  
  return encryptPasswordSimple(password);
};
