import type { APIRoute } from 'astro';
import { query } from '../../../lib/db';
import { sendEmail } from '../../../lib/mailer';
import { isAuthenticated } from '../../../lib/auth';
import { buildAssessmentCardEmail } from '../../../lib/assessmentCardEmail';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Admin login required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const trackingId = body.trackingId || body.id;

    if (!trackingId) {
      return new Response(JSON.stringify({ error: 'Candidate tracking ID or ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const evalRes = await query(
      'SELECT * FROM evaluations WHERE tracking_id = $1 OR id::text = $1 LIMIT 1',
      [trackingId]
    );

    if (evalRes.rows.length === 0) {
      return new Response(JSON.stringify({ error: `Candidate record not found for reference ${trackingId}.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const candidate = evalRes.rows[0];

    if (!candidate.email) {
      return new Response(JSON.stringify({ error: 'Candidate has no email address on record.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailContent = buildAssessmentCardEmail({
      trackingId: candidate.tracking_id,
      fullName: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone,
      age: candidate.age,
      passportNumber: candidate.passport_number,
      jobCategory: candidate.job_category,
      matchedCountry: candidate.matched_country,
      matchedJobTitle: candidate.matched_job_title,
      matchedProcessingTime: candidate.matched_processing_time,
      score: candidate.score,
      photoData: candidate.photo_data,
      startTimeline: candidate.start_timeline
    });

    const result = await sendEmail({
      to: candidate.email.trim().toLowerCase(),
      name: candidate.full_name,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
      trackingId: candidate.tracking_id,
      attachments: emailContent.attachments
    });

    if (!result.success) {
      return new Response(JSON.stringify({
        error: result.errorMessage || 'Failed to dispatch email through SMTP2GO.',
        status: result.status
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      status: result.status,
      message: `Evaluation Card dispatched to ${candidate.email} via support@mygotravel.eu.`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error in send-evaluation-card API:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
