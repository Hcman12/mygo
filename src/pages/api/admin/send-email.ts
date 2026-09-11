import type { APIRoute } from 'astro';
import { sendEmail } from '../../../lib/mailer';
import { isAuthenticated } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { to, name, subject, message, trackingId } = body;

    if (!to || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Recipient email, subject, and message are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #0f172a; font-size: 20px; letter-spacing: -0.5px;">MyGo Travel Relocation Services</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Official Case Update &amp; Admissions Notice</p>
        </div>
        ${trackingId ? `<div style="background: #f8fafc; padding: 8px 12px; border-left: 3px solid #0f172a; margin-bottom: 18px; font-size: 13px; color: #475569;">Reference Tracking: <strong>${trackingId}</strong></div>` : ''}
        <div style="font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-line;">
          ${message}
        </div>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; line-height: 1.5;">
          <p style="margin: 0 0 4px 0;"><strong>MyGo Travel International Relocation Directorate</strong></p>
          <p style="margin: 0;">Warsaw • Vilnius • Belgrade • Bucharest • Bratislava • Zagreb</p>
          <p style="margin: 4px 0 0 0;">Confidential European Immigration &amp; Workforce Sponsor Channel.</p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to,
      name,
      subject,
      text: message,
      html: htmlBody,
      trackingId
    });

    return new Response(JSON.stringify({
      success: true,
      status: result.status,
      message: result.status === 'sent' 
        ? `Email dispatched successfully to ${to}.` 
        : `Email queued and recorded for ${to}.`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error in send-email API:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
