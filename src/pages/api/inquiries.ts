import type { APIRoute } from 'astro';
import { query } from '../../lib/db';
import { sendEmail } from '../../lib/mailer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      topic = 'general',
      trackingId,
      subject,
      message
    } = body;

    if (!fullName || !email || !message) {
      return new Response(JSON.stringify({ 
        error: 'Full name, email address, and message are required.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailClean = email.trim().toLowerCase();
    const nameClean = fullName.trim();
    const cleanTrackingId = trackingId?.trim() || null;
    const resolvedSubject = subject?.trim() || `Support Docket [${topic.toUpperCase()}]${cleanTrackingId ? ` - Ref: ${cleanTrackingId}` : ''}`;

    const sql = `
      INSERT INTO inquiries (
        tracking_id, full_name, email, phone, topic, subject, message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'unread')
      RETURNING id, created_at;
    `;

    const values = [
      cleanTrackingId,
      nameClean,
      emailClean,
      phone?.trim() || null,
      topic,
      resolvedSubject,
      message.trim()
    ];

    const result = await query(sql, values);
    const newInquiry = result.rows[0];

    // Dispatch automated confirmation receipt to candidate
    try {
      const ackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0; padding:24px; background-color:#f1f5f9; font-family:Helvetica, Arial, sans-serif; color:#1e293b;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px; margin:0 auto; background-color:#ffffff; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden;">
    <tr>
      <td style="padding:24px 32px; background-color:#0f172a; text-align:center;">
        <div style="font-size:20px; font-weight:800; color:#ffffff;">MyGo <span style="color:#f97316;">Travel</span></div>
        <p style="margin:4px 0 0 0; font-size:12px; color:#94a3b8;">European Relocation Support Desk</p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;">
        <h2 style="margin:0 0 12px 0; font-size:18px; color:#0f172a;">Inquiry Docket Registered #INQ-${newInquiry.id}</h2>
        <p style="margin:0 0 14px 0; font-size:13px; line-height:1.6; color:#475569;">
          Dear ${nameClean},<br/><br/>
          Thank you for reaching out to the MyGo Travel European Admissions Directorate. Your inquiry regarding <strong>${topic}</strong> has been assigned to a case counselor.
        </p>

        ${cleanTrackingId ? `
        <div style="margin:16px 0; padding:14px; background-color:#fffbeb; border:1px solid #fef3c7; border-radius:8px; font-size:12px; color:#92400e;">
          Linked Reference ID: <strong>${cleanTrackingId}</strong><br/>
          <a href="https://mygotravel.eu/track?id=${encodeURIComponent(cleanTrackingId)}" style="color:#d97706; font-weight:700; text-decoration:underline; display:inline-block; margin-top:6px;">
            Track Your Application Online →
          </a>
        </div>
        ` : ''}

        <p style="margin:14px 0 0 0; font-size:12px; line-height:1.6; color:#64748b;">
          A designated admissions officer will respond directly to this email or contact your WhatsApp number. You can reply directly to this message at <strong>support@mygotravel.eu</strong>.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:18px 32px; background-color:#f8fafc; border-top:1px solid #e2e8f0; text-align:center; font-size:11px; color:#94a3b8;">
        MyGo Travel European Relocation Services • Official Support: support@mygotravel.eu
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();

      await sendEmail({
        to: emailClean,
        name: nameClean,
        subject: `[Docket #INQ-${newInquiry.id}] Inquiry Received: ${resolvedSubject}`,
        text: `Dear ${nameClean},\n\nThank you for contacting MyGo Travel. Your inquiry has been registered (Ref: #INQ-${newInquiry.id}). Our admissions officers typically respond in under 2 hours.\n\nBest regards,\nMyGo Travel Support (support@mygotravel.eu)`,
        html: ackHtml,
        trackingId: cleanTrackingId || undefined
      });
    } catch (ackErr) {
      console.warn('Failed to send inquiry receipt email:', ackErr);
    }

    return new Response(JSON.stringify({
      success: true,
      inquiryId: newInquiry.id,
      message: 'Support docket registered successfully. An officer will respond shortly.'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error saving support inquiry:', error);
    return new Response(JSON.stringify({
      error: 'Failed to record support inquiry.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
