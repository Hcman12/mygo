import type { APIRoute } from 'astro';
import { query } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, request }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Admin authentication required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get('search')?.trim() || '';
  const statusFilter = url.searchParams.get('status') || 'all';
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  try {
    let whereClauses: string[] = [];
    let values: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClauses.push(`(
        LOWER(full_name) LIKE LOWER($${paramIndex}) OR
        LOWER(email) LIKE LOWER($${paramIndex}) OR
        LOWER(phone) LIKE LOWER($${paramIndex}) OR
        LOWER(tracking_id) LIKE LOWER($${paramIndex}) OR
        LOWER(subject) LIKE LOWER($${paramIndex}) OR
        LOWER(message) LIKE LOWER($${paramIndex})
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (statusFilter && statusFilter !== 'all') {
      whereClauses.push(`status = $${paramIndex}`);
      values.push(statusFilter);
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count for current filter
    const countRes = await query(`SELECT COUNT(*) as total FROM inquiries ${whereSql}`, values);
    const total = parseInt(countRes.rows[0].total || '0', 10);

    // Unread count
    const unreadRes = await query(`SELECT COUNT(*) as unread FROM inquiries WHERE status = 'unread'`);
    const unreadCount = parseInt(unreadRes.rows[0].unread || '0', 10);

    // Fetch inquiries list
    const listValues = [...values, limit, offset];
    const listSql = `
      SELECT id, tracking_id, full_name, email, phone, topic, subject, message, status, is_starred, admin_reply, replied_at, created_at
      FROM inquiries
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const listRes = await query(listSql, listValues);

    return new Response(JSON.stringify({
      success: true,
      inquiries: listRes.rows,
      total,
      unreadCount,
      limit,
      offset
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error fetching admin inbox inquiries:', err);
    return new Response(JSON.stringify({ error: 'Failed to retrieve inbox messages.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PATCH: APIRoute = async ({ cookies, request }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { id, status, isStarred } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Inquiry ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (status !== undefined) {
      await query(`UPDATE inquiries SET status = $1 WHERE id = $2`, [status, id]);
    }

    if (isStarred !== undefined) {
      await query(`UPDATE inquiries SET is_starred = $1 WHERE id = $2`, [Boolean(isStarred), id]);
    }

    return new Response(JSON.stringify({ success: true, message: 'Inquiry updated successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error updating inquiry:', err);
    return new Response(JSON.stringify({ error: 'Failed to update inquiry status.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
