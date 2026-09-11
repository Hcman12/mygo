import type { APIRoute } from 'astro';
import { query } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';

export const prerender = false;

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

export const GET: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const destination = url.searchParams.get('destination')?.trim();
    const status = url.searchParams.get('status')?.trim();

    const conditions: string[] = [];
    const params: any[] = [];

    if (destination) {
      params.push(destination);
      conditions.push(`LOWER(matched_country) = LOWER($${params.length})`);
    }

    if (status && status !== 'all') {
      params.push(status.toLowerCase());
      conditions.push(`LOWER(COALESCE(status, 'pending')) = LOWER($${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const res = await query(
      `SELECT tracking_id, full_name, email, phone, age, passport_number,
              marital_status, experience_years, job_category, preferred_destination,
              matched_country, matched_job_title, matched_processing_time, score,
              status, COALESCE(admin_notes, '') as admin_notes, city, country, ip_address, created_at
       FROM evaluations
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    const headers = [
      'Tracking ID',
      'Full Name',
      'Email',
      'Phone',
      'Age',
      'Passport Number',
      'Marital Status',
      'Experience',
      'Job Category',
      'Preferred Destination',
      'Matched Country',
      'Matched Job Title',
      'Processing Time',
      'Assessment Score',
      'Status',
      'Admissions Notes',
      'City',
      'Origin Country',
      'Applicant IP',
      'Date Submitted'
    ];

    const rows = res.rows.map(row => [
      escapeCsvField(row.tracking_id),
      escapeCsvField(row.full_name),
      escapeCsvField(row.email),
      escapeCsvField(row.phone),
      escapeCsvField(row.age),
      escapeCsvField(row.passport_number),
      escapeCsvField(row.marital_status),
      escapeCsvField(row.experience_years),
      escapeCsvField(row.job_category),
      escapeCsvField(row.preferred_destination),
      escapeCsvField(row.matched_country),
      escapeCsvField(row.matched_job_title),
      escapeCsvField(row.matched_processing_time),
      escapeCsvField(row.score),
      escapeCsvField(row.status || 'pending'),
      escapeCsvField(row.admin_notes),
      escapeCsvField(row.city),
      escapeCsvField(row.country),
      escapeCsvField(row.ip_address),
      escapeCsvField(row.created_at ? new Date(row.created_at).toISOString() : '')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const filename = `mygo_evaluations_${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (err: any) {
    console.error('Error generating CSV export:', err);
    return new Response(`Export failed: ${err.message}`, { status: 500 });
  }
};
