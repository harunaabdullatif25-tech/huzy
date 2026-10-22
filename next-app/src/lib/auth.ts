import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'blossom_and_box_secure_jwt_secret_token_2026_xyz_key';

export const ADMIN_CREDENTIALS = {
  email: (process.env.ADMIN_EMAIL || 'admin@blossomandbox.com').toLowerCase().trim(),
  password: process.env.ADMIN_PASSWORD || 'AdminPassword2026!',
};

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

/**
 * Hashes a plain text password with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares plain text password with a hashed password.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Signs a JWT token for customer or admin session.
 */
export function signToken(payload: TokenPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

/**
 * Verifies a JWT token and returns the decoded payload, or null if invalid/expired.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
