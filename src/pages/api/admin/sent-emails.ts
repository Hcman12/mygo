import type { APIRoute } from 'astro';
import { query } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const res = await query(`
      SELECT id, to_email, to_name, subject, body, tracking_id, status, error_message, sent_at
      FROM sent_emails
      ORDER BY sent_at DESC
      LIMIT 100
    `);

    return new Response(JSON.stringify({
      emails: res.rows
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error fetching sent emails:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
