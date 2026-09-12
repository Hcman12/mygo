import type { APIRoute } from 'astro';
import { sendEmail } from '../../../lib/mailer';
import { isAuthenticated } from '../../../lib/auth';
import { query } from '../../../lib/db';
import { buildAssessmentCardEmail } from '../../../lib/assessmentCardEmail';
import fs from 'fs';
import path from 'path';

export const prerender = false;

const WHATSAPP_SVG = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" style="vertical-align:middle; margin-right:8px; display:inline-block;"><defs><path id="a" d="M1023.941 765.153c0 5.606-.171 17.766-.508 27.159-.824 22.982-2.646 52.639-5.401 66.151-4.141 20.306-10.392 39.472-18.542 55.425-9.643 18.871-21.943 35.775-36.559 50.364-14.584 14.56-31.472 26.812-50.315 36.416-16.036 8.172-35.322 14.426-55.744 18.549-13.378 2.701-42.812 4.488-65.648 5.3-9.402.336-21.564.505-27.15.505l-504.226-.081c-5.607 0-17.765-.172-27.158-.509-22.983-.824-52.639-2.646-66.152-5.4-20.306-4.142-39.473-10.392-55.425-18.542-18.872-9.644-35.775-21.944-50.364-36.56-14.56-14.584-26.812-31.471-36.415-50.314-8.174-16.037-14.428-35.323-18.551-55.744-2.7-13.378-4.487-42.812-5.3-65.649-.334-9.401-.503-21.563-.503-27.148l.08-504.228c0-5.607.171-17.766.508-27.159.825-22.983 2.646-52.639 5.401-66.151 4.141-20.306 10.391-39.473 18.542-55.426C34.154 93.24 46.455 76.336 61.07 61.747c14.584-14.559 31.472-26.812 50.315-36.416 16.037-8.172 35.324-14.426 55.745-18.549 13.377-2.701 42.812-4.488 65.648-5.3 9.402-.335 21.565-.504 27.149-.504l504.227.081c5.608 0 17.766.171 27.159.508 22.983.825 52.638 2.646 66.152 5.401 20.305 4.141 39.472 10.391 55.425 18.542 18.871 9.643 35.774 21.944 50.363 36.559 14.559 14.584 26.812 31.471 36.415 50.315 8.174 16.037 14.428 35.323 18.551 55.744 2.7 13.378 4.486 42.812 5.3 65.649.335 9.402.504 21.564.504 27.15l-.082 504.226z"></path></defs><linearGradient id="b" gradientUnits="userSpaceOnUse" x1="512.001" y1=".978" x2="512.001" y2="1025.023"><stop offset="0" stop-color="#61fd7d"></stop><stop offset="1" stop-color="#2bb826"></stop></linearGradient><use xlink:href="#a" overflow="visible" fill="url(#b)"></use><g><path fill="#FFF" d="M783.302 243.246c-69.329-69.387-161.529-107.619-259.763-107.658-202.402 0-367.133 164.668-367.214 367.072-.026 64.699 16.883 127.854 49.017 183.522l-52.096 190.229 194.665-51.047c53.636 29.244 114.022 44.656 175.482 44.682h.151c202.382 0 367.128-164.688 367.21-367.094.039-98.087-38.121-190.319-107.452-259.706zM523.544 808.047h-.125c-54.767-.021-108.483-14.729-155.344-42.529l-11.146-6.612-115.517 30.293 30.834-112.592-7.259-11.544c-30.552-48.579-46.688-104.729-46.664-162.379.066-168.229 136.985-305.096 305.339-305.096 81.521.031 158.154 31.811 215.779 89.482s89.342 134.332 89.312 215.859c-.066 168.243-136.984 305.118-305.209 305.118zm167.415-228.515c-9.177-4.591-54.286-26.782-62.697-29.843-8.41-3.062-14.526-4.592-20.645 4.592-6.115 9.182-23.699 29.843-29.053 35.964-5.352 6.122-10.704 6.888-19.879 2.296-9.176-4.591-38.74-14.277-73.786-45.526-27.275-24.319-45.691-54.359-51.043-63.543-5.352-9.183-.569-14.146 4.024-18.72 4.127-4.109 9.175-10.713 13.763-16.069 4.587-5.355 6.117-9.183 9.175-15.304 3.059-6.122 1.529-11.479-.765-16.07-2.293-4.591-20.644-49.739-28.29-68.104-7.447-17.886-15.013-15.466-20.645-15.747-5.346-.266-11.469-.322-17.585-.322s-16.057 2.295-24.467 11.478-32.113 31.374-32.113 76.521c0 45.147 32.877 88.764 37.465 94.885 4.588 6.122 64.699 98.771 156.741 138.502 21.892 9.45 38.982 15.094 52.308 19.322 21.98 6.979 41.982 5.995 57.793 3.634 17.628-2.633 54.284-22.189 61.932-43.615 7.646-21.427 7.646-39.791 5.352-43.617-2.294-3.826-8.41-6.122-17.585-10.714z"></path></g></svg>`;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { to, name, subject, message, trackingId, isEvaluationCard } = body;

    if (!to) {
      return new Response(JSON.stringify({ error: 'Recipient email is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. If requested to send the full authentic Candidate Evaluation Card:
    if (isEvaluationCard && trackingId) {
      const evalRes = await query(
        'SELECT * FROM evaluations WHERE tracking_id = $1 OR id::text = $1 LIMIT 1',
        [trackingId]
      );
      if (evalRes.rows.length > 0) {
        const row = evalRes.rows[0];
        const cardEmail = buildAssessmentCardEmail({
          trackingId: row.tracking_id,
          fullName: row.full_name,
          email: row.email,
          phone: row.phone,
          age: row.age,
          passportNumber: row.passport_number,
          jobCategory: row.job_category,
          matchedCountry: row.matched_country,
          matchedJobTitle: row.matched_job_title,
          matchedProcessingTime: row.matched_processing_time,
          score: row.score,
          photoData: row.photo_data,
          startTimeline: row.start_timeline
        });

        const result = await sendEmail({
          to: to.trim().toLowerCase(),
          name: row.full_name,
          subject: subject || cardEmail.subject,
          text: cardEmail.text,
          html: cardEmail.html,
          trackingId: row.tracking_id,
          attachments: cardEmail.attachments
        });

        if (!result.success) {
          return new Response(JSON.stringify({
            error: result.errorMessage || 'Failed to dispatch email via SMTP.',
            status: result.status
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: true,
          status: result.status,
          message: `Official Evaluation Card dispatched successfully to ${to} via support@mygotravel.eu.`
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (!subject || !message) {
      return new Response(JSON.stringify({ error: 'Subject and message are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Build authentic institutional email with attachments
    const brandLogoPath = path.resolve(process.cwd(), 'Mygo_Travel_Logo.png');
    const nicerappLogoPath = path.resolve(process.cwd(), 'nicerapplogo.png');
    const attachments: Array<{
      filename: string;
      content: Buffer;
      cid: string;
      contentType: string;
    }> = [];

    let hasBrandLogo = false;
    if (fs.existsSync(brandLogoPath)) {
      attachments.push({
        filename: 'Mygo_Travel_Logo.png',
        content: fs.readFileSync(brandLogoPath),
        cid: 'mygologo@mygotravel.eu',
        contentType: 'image/png'
      });
      hasBrandLogo = true;
    }

    let hasNicerappLogo = false;
    if (fs.existsSync(nicerappLogoPath)) {
      attachments.push({
        filename: 'nicerapplogo.png',
        content: fs.readFileSync(nicerappLogoPath),
        cid: 'nicerapplogo@mygotravel.eu',
        contentType: 'image/png'
      });
      hasNicerappLogo = true;
    }

    attachments.push({
      filename: 'whatsapp-icon.svg',
      content: Buffer.from(WHATSAPP_SVG, 'utf-8'),
      cid: 'whatsappicon@mygotravel.eu',
      contentType: 'image/svg+xml'
    });

    const whatsappUrl = `https://wa.me/12099493346?text=${encodeURIComponent(`Hello MyGo Travel Admissions, regarding my application ${trackingId || ''}`)}`;
    const nicerappUrl = `https://nicerapp.cloud/invite/cd0452e9-e0be-4f0d-9fde-2aaa865c4e01`;

    const brandHeaderHtml = hasBrandLogo
      ? `<img src="cid:mygologo@mygotravel.eu" alt="MyGo Travel" height="34" style="height:34px; max-height:34px; width:auto; display:block;" />`
      : `<div style="font-size:22px; font-weight:800; color:#0f172a;">MyGo <span style="color:#f97316;">Travel</span></div>`;

    const nicerappIconHtml = hasNicerappLogo
      ? `<img src="cid:nicerapplogo@mygotravel.eu" width="20" height="20" alt="NicerApp" style="width:20px; height:20px; border-radius:50%; vertical-align:middle; margin-right:8px; display:inline-block;" />`
      : `<span style="font-size:15px; vertical-align:middle; margin-right:8px;">💬</span>`;

    const whatsappIconHtml = `<img src="cid:whatsappicon@mygotravel.eu" width="20" height="20" alt="WhatsApp" style="width:20px; height:20px; vertical-align:middle; margin-right:8px; display:inline-block;" />`;

    const formattedMessage = message
      .split('\n\n')
      .map((para: string) => `<p style="margin:0 0 14px 0; font-size:14px; line-height:1.6; color:#334155;">${para.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#1e293b;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc; padding:32px 16px;">
    <tr>
      <td align="center">
        
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px; background-color:#ffffff; border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); overflow:hidden;">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding:24px 32px; border-bottom:1px solid #e2e8f0; background-color:#ffffff;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    ${brandHeaderHtml}
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <div style="font-size:11px; text-transform:uppercase; font-weight:700; letter-spacing:0.5px; color:#0f766e;">
                      Official Admissions Notice
                    </div>
                    ${trackingId ? `<div style="font-family:monospace; font-size:11px; font-weight:700; color:#64748b; margin-top:2px;">Ref: ${trackingId}</div>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:28px 32px;">
              <h2 style="margin:0 0 16px 0; font-size:18px; font-weight:700; color:#0f172a; line-height:1.4;">
                ${subject}
              </h2>
              ${trackingId ? `
              <div style="background-color:#f8fafc; border-left:3px solid #0f172a; padding:8px 14px; margin-bottom:20px; font-size:12px; color:#475569;">
                Application Reference: <strong style="color:#0f172a; font-family:monospace;">${trackingId}</strong>
              </div>
              ` : ''}
              
              <div style="font-size:14px; line-height:1.6; color:#334155;">
                ${formattedMessage}
              </div>

              <!-- Action Buttons -->
              <div style="margin-top:28px; padding-top:20px; border-top:1px solid #e2e8f0; text-align:center;">
                <div style="font-size:13px; font-weight:700; color:#0f172a; margin-bottom:14px;">
                  Admissions & Case Support Desk:
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  ${trackingId ? `
                  <tr>
                    <td align="center" style="padding-bottom:10px;">
                      <a href="https://mygotravel.eu/track?id=${encodeURIComponent(trackingId)}" target="_blank" style="display:inline-block; width:88%; max-width:280px; background-color:#ea580c; color:#ffffff; text-decoration:none; padding:11px 16px; border-radius:8px; font-size:13px; font-weight:800; text-align:center; vertical-align:middle; box-shadow:0 2px 6px rgba(234,88,12,0.25);">
                        <span style="vertical-align:middle; margin-right:6px;">📦</span>
                        <span style="vertical-align:middle;">Track Application Online</span>
                      </a>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td align="center" style="padding-bottom:10px;">
                      <a href="${whatsappUrl}" target="_blank" style="display:inline-block; width:88%; max-width:280px; background-color:#25D366; color:#ffffff; text-decoration:none; padding:11px 16px; border-radius:8px; font-size:13px; font-weight:700; text-align:center; vertical-align:middle;">
                        ${whatsappIconHtml}
                        <span style="vertical-align:middle;">Chat on WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <a href="${nicerappUrl}" target="_blank" style="display:inline-block; width:88%; max-width:280px; background-color:#1e40af; color:#ffffff; text-decoration:none; padding:11px 16px; border-radius:8px; font-size:13px; font-weight:700; text-align:center; vertical-align:middle;">
                        ${nicerappIconHtml}
                        <span style="vertical-align:middle;">Contact us on nicerapp</span>
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; background-color:#f8fafc; border-top:1px solid #e2e8f0; text-align:center; font-size:11px; line-height:1.6; color:#64748b;">
              <p style="margin:0 0 4px 0; font-weight:600; color:#475569;">
                MyGo Travel European Admissions Directorate
              </p>
              <p style="margin:0 0 6px 0;">
                Official Inquiries: <a href="mailto:support@mygotravel.eu" style="color:#0284c7; text-decoration:none; font-weight:600;">support@mygotravel.eu</a>
              </p>
              <p style="margin:0; font-size:10px; color:#94a3b8;">
                © 2026 MyGo Travel. All rights reserved. Registered European Migration Advisory Services.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const result = await sendEmail({
      to: to.trim().toLowerCase(),
      name: name?.trim() || '',
      subject,
      text: message,
      html: htmlBody,
      trackingId,
      attachments
    });

    if (!result.success) {
      return new Response(JSON.stringify({
        error: result.errorMessage || 'Failed to dispatch email via SMTP2GO.',
        status: result.status
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      status: result.status,
      message: `Email dispatched successfully to ${to} via support@mygotravel.eu.`
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
