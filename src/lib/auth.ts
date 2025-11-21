// Simple JWT-like authentication utilities
// Note: In production, use proper JWT libraries with proper secret management

export interface User {
  id: number;
  email: string;
  name: string;
  company?: string;
  role: 'shipper' | 'forwarder' | 'carrier';
  phone?: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: number;
}

// Simple password hashing simulation (in production, use bcrypt or argon2)
export async function hashPassword(password: string): Promise<string> {
  // This is a simplified version - in production, use Web Crypto API or a proper library
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Simple session token generation
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

// Extract session from cookie or header
export function extractSession(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  
  if (!sessionCookie) return null;
  return sessionCookie.split('=')[1];
}
