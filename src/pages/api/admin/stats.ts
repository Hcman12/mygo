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
    // 1. Overall Totals
    const [evalCountRes, pageViewCountRes, emailCountRes] = await Promise.all([
      query('SELECT COUNT(*) as total FROM evaluations'),
      query('SELECT COUNT(*) as total FROM page_views'),
      query('SELECT COUNT(*) as total FROM sent_emails')
    ]);

    const totalEvaluations = parseInt(evalCountRes.rows[0]?.total || '0', 10);
    const totalPageViews = parseInt(pageViewCountRes.rows[0]?.total || '0', 10);
    const totalEmailsSent = parseInt(emailCountRes.rows[0]?.total || '0', 10);

    // 2. Unique IPs
    const uniqueIpsRes = await query(`
      SELECT COUNT(DISTINCT ip_address) as unique_visitors 
      FROM (
        SELECT ip_address FROM page_views WHERE ip_address IS NOT NULL
        UNION
        SELECT ip_address FROM evaluations WHERE ip_address IS NOT NULL
      ) combined_ips
    `);
    const uniqueVisitors = parseInt(uniqueIpsRes.rows[0]?.unique_visitors || '0', 10);

    // 3. Page Breakdown (which pages are most visited)
    const pageBreakdownRes = await query(`
      SELECT path, COUNT(*) as views
      FROM page_views
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `);

    // 4. Visitor Origin by Country (from IP geolocation)
    const geoBreakdownRes = await query(`
      SELECT COALESCE(country, 'Unknown') as country, COUNT(*) as visitor_count
      FROM page_views
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country
      ORDER BY visitor_count DESC
      LIMIT 10
    `);

    // 5. Matched Destinations Breakdown
    const destinationBreakdownRes = await query(`
      SELECT COALESCE(matched_country, 'Pending') as destination, COUNT(*) as applicant_count
      FROM evaluations
      GROUP BY matched_country
      ORDER BY applicant_count DESC
      LIMIT 8
    `);

    // 6. Status Breakdown
    const statusBreakdownRes = await query(`
      SELECT COALESCE(status, 'pending') as status, COUNT(*) as count
      FROM evaluations
      GROUP BY status
      ORDER BY count DESC
    `);

    // 7. Recent 5 evaluations
    const recentEvalsRes = await query(`
      SELECT id, tracking_id, full_name, email, phone, matched_country, status, city, country, created_at
      FROM evaluations
      ORDER BY created_at DESC
      LIMIT 5
    `);

    return new Response(JSON.stringify({
      totals: {
        evaluations: totalEvaluations,
        pageViews: totalPageViews,
        uniqueVisitors: Math.max(uniqueVisitors, 1),
        emailsSent: totalEmailsSent
      },
      pageBreakdown: pageBreakdownRes.rows,
      geoBreakdown: geoBreakdownRes.rows,
      destinationBreakdown: destinationBreakdownRes.rows,
      statusBreakdown: statusBreakdownRes.rows,
      recentEvaluations: recentEvalsRes.rows
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error fetching admin statistics:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
