import type { APIRoute } from 'astro';
import { query } from '../../../lib/db';
import { getClientIp, lookupIp } from '../../../lib/geo';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { path = '/', title = '', referrer = '' } = body;

    // Do not log internal admin portal requests
    if (typeof path === 'string' && path.startsWith('/nicle')) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ip = getClientIp(request);
    const geo = await lookupIp(ip);
    const userAgent = request.headers.get('user-agent') || '';

    await query(
      `INSERT INTO page_views (path, title, ip_address, city, country, referrer, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [path.slice(0, 255), title.slice(0, 255), geo.ip, geo.city, geo.country, referrer, userAgent]
    );

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    // Analytics failures should never crash the user experience
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
