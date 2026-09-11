import type { AstroCookies } from 'astro';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_USER = process.env.ADMIN_USERNAME || 'niclenet';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || '112Teamall@';
const SESSION_COOKIE_NAME = 'mygo_admin_session';
const SESSION_TOKEN = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}:mygo-2026-auth-valid`).toString('base64');

export function checkCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  return username.trim() === ADMIN_USER && password.trim() === ADMIN_PASS;
}

export function setAdminSession(cookies: AstroCookies): void {
  cookies.set(SESSION_COOKIE_NAME, SESSION_TOKEN, {
    path: '/',
    httpOnly: true,
    secure: false, // works seamlessly on both http localhost and https production
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days session
  });
}

export function clearAdminSession(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE_NAME, {
    path: '/',
  });
}

export function isAuthenticated(cookies: AstroCookies): boolean {
  const session = cookies.get(SESSION_COOKIE_NAME)?.value;
  return session === SESSION_TOKEN;
}
