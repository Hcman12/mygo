import type { APIRoute } from 'astro';
import { query } from '../../../lib/db';
import { getClientIp, lookupIp } from '../../../lib/geo';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      trackingId,
      fullName,
      phone,
      email,
      age,
      passportNumber,
      address,
      maritalStatus,
      experienceYears,
      jobCategory,
      startTimeline,
      preferredDestination,
      matchedCountry,
      matchedJobTitle,
      matchedProcessingTime,
      score,
      photoData,
      cvFilename
    } = body;

    if (!trackingId || !fullName || !email) {
      return new Response(JSON.stringify({ error: 'Tracking ID, full name, and email are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ip = getClientIp(request);
    const geo = await lookupIp(ip);
    const userAgent = request.headers.get('user-agent') || '';

    const sql = `
      INSERT INTO evaluations (
        tracking_id, full_name, phone, email, age, passport_number,
        address, marital_status, experience_years, job_category,
        start_timeline, preferred_destination, matched_country,
        matched_job_title, matched_processing_time, score,
        photo_data, cv_filename, ip_address, city, country, country_code, user_agent
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13,
        $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23
      )
      ON CONFLICT (tracking_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        matched_country = EXCLUDED.matched_country,
        score = EXCLUDED.score
      RETURNING id, tracking_id, created_at;
    `;

    const values = [
      trackingId,
      fullName.trim(),
      phone || null,
      email.trim().toLowerCase(),
      age ? parseInt(age, 10) : null,
      passportNumber || null,
      address || null,
      maritalStatus || null,
      experienceYears || null,
      jobCategory || null,
      startTimeline || null,
      preferredDestination || null,
      matchedCountry || null,
      matchedJobTitle || null,
      matchedProcessingTime || null,
      score ? parseInt(score, 10) : 95,
      photoData || null,
      cvFilename || null,
      geo.ip,
      geo.city,
      geo.country,
      geo.countryCode,
      userAgent
    ];

    const result = await query(sql, values);
    const saved = result.rows[0];

    return new Response(JSON.stringify({
      success: true,
      id: saved.id,
      trackingId: saved.tracking_id,
      message: 'Candidate evaluation recorded successfully.'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('API Error saving evaluation:', error);
    return new Response(JSON.stringify({
      error: 'Failed to record candidate evaluation.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
