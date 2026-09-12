import type { APIRoute } from 'astro';
import { query } from '../../lib/db';

export const prerender = false;

interface StepItem {
  id: number;
  title: string;
  subtitle: string;
  status: 'completed' | 'current' | 'upcoming';
  dateLabel?: string;
  badge?: string;
  description: string;
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const rawId = url.searchParams.get('id')?.trim() || '';

  if (!rawId) {
    return new Response(JSON.stringify({ 
      error: 'Please provide a valid application Tracking Reference (e.g. mygo123456).' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const res = await query(
      `SELECT tracking_id, full_name, email, phone, matched_country, matched_job_title,
              matched_processing_time, score, status, start_timeline, created_at, updated_at
       FROM evaluations
       WHERE LOWER(tracking_id) = LOWER($1) OR LOWER(email) = LOWER($1)
       LIMIT 1`,
      [rawId]
    );

    if (res.rows.length === 0) {
      return new Response(JSON.stringify({
        found: false,
        error: `No relocation dossier found matching Reference ID "${rawId}". Please verify your Tracking ID from your confirmation email or eligibility pass.`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const candidate = res.rows[0];
    const status: string = (candidate.status || 'pending').toLowerCase();
    const createdAt = new Date(candidate.created_at || Date.now());
    const updatedAt = new Date(candidate.updated_at || candidate.created_at || Date.now());

    // Format dates for the tracking timeline
    const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const submissionDateStr = formatDate(createdAt);
    const updateDateStr = formatDate(updatedAt);

    let progressPercentage = 20;
    let statusLabel = 'Assessment Passed · Pending Review';
    let statusBadgeColor = 'amber';

    // 5-Step Order-Tracking Stepper
    const steps: StepItem[] = [
      {
        id: 1,
        title: 'Eligibility Evaluation Passed',
        subtitle: `${candidate.score || 95}% Match Index Confirmed`,
        status: 'completed',
        dateLabel: submissionDateStr,
        badge: 'Verified',
        description: `Candidate profile successfully scored and matched to ${candidate.matched_country || 'European Destination'} for ${candidate.matched_job_title || 'Relocation Vacancy'}.`
      },
      {
        id: 2,
        title: 'Dossier & Bio-Data Verification',
        subtitle: 'Passport, Police Clearance & CV Vetting',
        status: 'upcoming',
        description: 'Admissions officers inspect passport validity, police conduct certs, and trade references for employer legal clearance.'
      },
      {
        id: 3,
        title: 'Work Permit & Labor Ministry Sponsorship',
        subtitle: 'Employer Quota Registration',
        status: 'upcoming',
        description: 'Authorized host employer files official work permit registration with national Ministry of Labor & Immigration.'
      },
      {
        id: 4,
        title: 'Consular Appointment & Visa Stamping',
        subtitle: 'Embassy National D-Visa Clearance',
        status: 'upcoming',
        description: 'Consular interview booking, biometric capture, and Schengen National Type-D entry visa issuance.'
      },
      {
        id: 5,
        title: 'Accommodation & Relocation Dispatch',
        subtitle: 'Employer Housing & Shift Meal Activation',
        status: 'upcoming',
        description: 'Fully furnished accommodation prepared, shift meal plan activated, and flight reception scheduled.'
      }
    ];

    if (status === 'pending') {
      progressPercentage = 25;
      statusLabel = 'Under Initial Intake Review';
      statusBadgeColor = 'amber';
      steps[1].status = 'current';
      steps[1].dateLabel = 'In Progress';
    } else if (status === 'reviewing' || status === 'docs_requested') {
      progressPercentage = 40;
      statusLabel = status === 'docs_requested' ? 'Action Required: High-Res Documents' : 'Dossier Under Consular Review';
      statusBadgeColor = status === 'docs_requested' ? 'purple' : 'blue';
      steps[1].status = 'current';
      steps[1].dateLabel = updateDateStr;
      if (status === 'docs_requested') {
        steps[1].subtitle = 'Pending High-Res Passport Bio-Data Submission';
      }
    } else if (status === 'approved') {
      progressPercentage = 55;
      statusLabel = 'Dossier Approved · Filing Work Permit';
      statusBadgeColor = 'emerald';
      steps[1].status = 'completed';
      steps[1].dateLabel = updateDateStr;
      steps[2].status = 'current';
      steps[2].dateLabel = 'Processing with Ministry';
    } else if (status === 'interview') {
      progressPercentage = 75;
      statusLabel = 'Embassy Consular Interview Scheduled';
      statusBadgeColor = 'indigo';
      steps[1].status = 'completed';
      steps[2].status = 'completed';
      steps[2].dateLabel = updateDateStr;
      steps[3].status = 'current';
      steps[3].dateLabel = 'Interview Queue';
    } else if (status === 'visa_processing') {
      progressPercentage = 85;
      statusLabel = 'Visa Permit Stamping in Progress';
      statusBadgeColor = 'teal';
      steps[1].status = 'completed';
      steps[2].status = 'completed';
      steps[3].status = 'current';
      steps[3].dateLabel = 'Embassy Stamping';
    } else if (status === 'completed') {
      progressPercentage = 100;
      statusLabel = 'Visa Issued · Relocation Ready';
      statusBadgeColor = 'emerald';
      steps.forEach(s => s.status = 'completed');
      steps[4].dateLabel = updateDateStr;
    } else if (status === 'rejected') {
      progressPercentage = 100;
      statusLabel = 'Application Suspended / Review Rejected';
      statusBadgeColor = 'rose';
    }

    return new Response(JSON.stringify({
      found: true,
      data: {
        trackingId: candidate.tracking_id,
        fullName: candidate.full_name,
        email: candidate.email,
        phone: candidate.phone,
        matchedCountry: candidate.matched_country || 'Schengen Europe',
        matchedJobTitle: candidate.matched_job_title || 'Operations Associate',
        matchedProcessingTime: candidate.matched_processing_time || '2–4 months',
        score: candidate.score || 95,
        startTimeline: candidate.start_timeline || 'Immediate',
        status,
        statusLabel,
        statusBadgeColor,
        progressPercentage,
        submittedAt: submissionDateStr,
        lastUpdated: updateDateStr,
        housingProvided: true,
        mealsIncluded: true,
        steps
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=15, s-maxage=30'
      }
    });
  } catch (error: any) {
    console.error('API Error in /api/track:', error);
    return new Response(JSON.stringify({
      error: 'Failed to retrieve application tracking dossier.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
