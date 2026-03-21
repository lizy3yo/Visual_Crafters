import brypt from 'bcryptjs';

// Hashes a plain text password using bcrypt and returns the hashed password
export async function hashPassword(password: string): Promise<string> {
    const salt = await brypt.genSalt(12);
    const hashedPassword = await brypt.hash(password, salt);
    return hashedPassword;
}

// Compares a plain text password with a hashed password and returns true if they match, false otherwise
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    const isValid = await brypt.compare(password, hashedPassword);
    return isValid;
}