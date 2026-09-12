import type { APIRoute } from 'astro';
import { query } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Admin login required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const q = url.searchParams.get('q')?.trim();
    const destination = url.searchParams.get('destination')?.trim();
    const status = url.searchParams.get('status')?.trim();
    const emailStatus = url.searchParams.get('emailStatus')?.trim();
    const sortBy = url.searchParams.get('sortBy') || 'newest';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Single record fetch
    if (id) {
      const res = await query('SELECT * FROM evaluations WHERE id::text = $1 OR tracking_id = $1', [id]);
      if (res.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Record not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const evaluation = res.rows[0];

      // Also fetch communication history / sent emails for this candidate
      const emailsRes = await query(
        `SELECT id, to_email, subject, body, status, sent_at
         FROM sent_emails
         WHERE tracking_id = $1 OR LOWER(to_email) = LOWER($2)
         ORDER BY sent_at DESC
         LIMIT 25`,
        [evaluation.tracking_id, evaluation.email]
      );

      return new Response(JSON.stringify({
        ...evaluation,
        communications: emailsRes.rows
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // List query with filters
    const conditions: string[] = [];
    const params: any[] = [];

    if (q) {
      params.push(`%${q}%`);
      const paramIdx = params.length;
      conditions.push(`(
        e.tracking_id ILIKE $${paramIdx} OR
        e.full_name ILIKE $${paramIdx} OR
        e.email ILIKE $${paramIdx} OR
        e.phone ILIKE $${paramIdx} OR
        e.matched_country ILIKE $${paramIdx} OR
        e.passport_number ILIKE $${paramIdx} OR
        e.city ILIKE $${paramIdx} OR
        e.country ILIKE $${paramIdx} OR
        e.job_category ILIKE $${paramIdx} OR
        COALESCE(e.admin_notes, '') ILIKE $${paramIdx}
      )`);
    }

    if (destination) {
      params.push(destination);
      conditions.push(`LOWER(e.matched_country) = LOWER($${params.length})`);
    }

    if (status && status !== 'all') {
      params.push(status.toLowerCase());
      conditions.push(`LOWER(COALESCE(e.status, 'pending')) = LOWER($${params.length})`);
    }

    if (emailStatus === 'unsent') {
      conditions.push(`NOT EXISTS (SELECT 1 FROM sent_emails s WHERE s.tracking_id = e.tracking_id OR LOWER(s.to_email) = LOWER(e.email))`);
    } else if (emailStatus === 'sent') {
      conditions.push(`EXISTS (SELECT 1 FROM sent_emails s WHERE s.tracking_id = e.tracking_id OR LOWER(s.to_email) = LOWER(e.email))`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count
    const countRes = await query(`SELECT COUNT(*) as total FROM evaluations e ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].total, 10);

    // Sorting
    let orderByClause = 'ORDER BY e.created_at DESC';
    if (sortBy === 'oldest') orderByClause = 'ORDER BY e.created_at ASC';
    else if (sortBy === 'score_desc') orderByClause = 'ORDER BY e.score DESC, e.created_at DESC';
    else if (sortBy === 'score_asc') orderByClause = 'ORDER BY e.score ASC, e.created_at DESC';
    else if (sortBy === 'status') orderByClause = 'ORDER BY e.status ASC, e.created_at DESC';

    // Records
    const queryParams = [...params];
    queryParams.push(limit);
    const limitIdx = queryParams.length;
    queryParams.push(offset);
    const offsetIdx = queryParams.length;

    const listRes = await query(
      `SELECT e.id, e.tracking_id, e.full_name, e.phone, e.email, e.age, e.passport_number,
              e.address, e.marital_status, e.experience_years, e.job_category,
              e.start_timeline, e.preferred_destination, e.matched_country,
              e.matched_job_title, e.matched_processing_time, e.score, e.status,
              e.admin_notes, e.photo_data, e.cv_filename, e.ip_address, e.city, e.country, e.country_code,
              e.created_at, e.updated_at,
              COALESCE((SELECT COUNT(*) FROM sent_emails s WHERE s.tracking_id = e.tracking_id OR LOWER(s.to_email) = LOWER(e.email)), 0)::int AS emails_sent_count
       FROM evaluations e
       ${whereClause}
       ${orderByClause}
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      queryParams
    );

    return new Response(JSON.stringify({
      total,
      limit,
      offset,
      evaluations: listRes.rows
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error fetching evaluations:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Admin login required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { id, trackingId, status, adminNotes } = body;
    const targetId = id || trackingId;

    if (!targetId) {
      return new Response(JSON.stringify({ error: 'Candidate ID or Tracking ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [];

    if (status !== undefined) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }

    if (adminNotes !== undefined) {
      params.push(adminNotes);
      updates.push(`admin_notes = $${params.length}`);
    }

    if (params.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields provided to update.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    params.push(targetId);
    const targetIdx = params.length;

    const sql = `
      UPDATE evaluations
      SET ${updates.join(', ')}
      WHERE id::text = $${targetIdx} OR tracking_id = $${targetIdx}
      RETURNING id, tracking_id, full_name, status, admin_notes, updated_at;
    `;

    const result = await query(sql, params);

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: 'No candidate record found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      evaluation: result.rows[0],
      message: `Candidate ${result.rows[0].tracking_id} updated successfully.`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error updating candidate evaluation:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    let id = url.searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id || body.trackingId;
    }

    if (!id) {
      return new Response(JSON.stringify({ error: 'Evaluation ID or Tracking ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let result;
    if (/^\d+$/.test(id)) {
      result = await query(
        'DELETE FROM evaluations WHERE id = $1 OR tracking_id = $2 RETURNING id, tracking_id, full_name',
        [parseInt(id, 10), id]
      );
    } else {
      result = await query(
        'DELETE FROM evaluations WHERE tracking_id = $1 RETURNING id, tracking_id, full_name',
        [id]
      );
    }

    if (result.rowCount === 0) {
      return new Response(JSON.stringify({ error: 'No evaluation found with that ID.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      deleted: result.rows[0],
      message: `Evaluation ${result.rows[0].tracking_id} successfully deleted.`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error deleting evaluation:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
