import fs from 'fs';
import path from 'path';

export interface AssessmentCandidateData {
  trackingId: string;
  fullName: string;
  email: string;
  phone?: string;
  age?: number | string;
  passportNumber?: string;
  jobCategory?: string;
  matchedCountry?: string;
  matchedJobTitle?: string;
  matchedProcessingTime?: string;
  score?: number | string;
  photoData?: string | null;
  startTimeline?: string;
}

const countryFlagMap: Record<string, string> = {
  'poland': '🇵🇱',
  'slovakia': '🇸🇰',
  'czech republic': '🇨🇿',
  'czech-republic': '🇨🇿',
  'hungary': '🇭🇺',
  'bulgaria': '🇧🇬',
  'portugal': '🇵🇹',
  'portugal-work': '🇵🇹',
  'portugal-student': '🇵🇹',
  'latvia': '🇱🇻',
  'lithuania': '🇱🇹',
  'serbia': '🇷🇸',
  'north macedonia': '🇲🇰',
  'north-macedonia': '🇲🇰',
  'ukraine': '🇺🇦'
};

const WHATSAPP_SVG = `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" style="vertical-align:middle; margin-right:8px; display:inline-block;"><defs><path id="a" d="M1023.941 765.153c0 5.606-.171 17.766-.508 27.159-.824 22.982-2.646 52.639-5.401 66.151-4.141 20.306-10.392 39.472-18.542 55.425-9.643 18.871-21.943 35.775-36.559 50.364-14.584 14.56-31.472 26.812-50.315 36.416-16.036 8.172-35.322 14.426-55.744 18.549-13.378 2.701-42.812 4.488-65.648 5.3-9.402.336-21.564.505-27.15.505l-504.226-.081c-5.607 0-17.765-.172-27.158-.509-22.983-.824-52.639-2.646-66.152-5.4-20.306-4.142-39.473-10.392-55.425-18.542-18.872-9.644-35.775-21.944-50.364-36.56-14.56-14.584-26.812-31.471-36.415-50.314-8.174-16.037-14.428-35.323-18.551-55.744-2.7-13.378-4.487-42.812-5.3-65.649-.334-9.401-.503-21.563-.503-27.148l.08-504.228c0-5.607.171-17.766.508-27.159.825-22.983 2.646-52.639 5.401-66.151 4.141-20.306 10.391-39.473 18.542-55.426C34.154 93.24 46.455 76.336 61.07 61.747c14.584-14.559 31.472-26.812 50.315-36.416 16.037-8.172 35.324-14.426 55.745-18.549 13.377-2.701 42.812-4.488 65.648-5.3 9.402-.335 21.565-.504 27.149-.504l504.227.081c5.608 0 17.766.171 27.159.508 22.983.825 52.638 2.646 66.152 5.401 20.305 4.141 39.472 10.391 55.425 18.542 18.871 9.643 35.774 21.944 50.363 36.559 14.559 14.584 26.812 31.471 36.415 50.315 8.174 16.037 14.428 35.323 18.551 55.744 2.7 13.378 4.486 42.812 5.3 65.649.335 9.402.504 21.564.504 27.15l-.082 504.226z"></path></defs><linearGradient id="b" gradientUnits="userSpaceOnUse" x1="512.001" y1=".978" x2="512.001" y2="1025.023"><stop offset="0" stop-color="#61fd7d"></stop><stop offset="1" stop-color="#2bb826"></stop></linearGradient><use xlink:href="#a" overflow="visible" fill="url(#b)"></use><g><path fill="#FFF" d="M783.302 243.246c-69.329-69.387-161.529-107.619-259.763-107.658-202.402 0-367.133 164.668-367.214 367.072-.026 64.699 16.883 127.854 49.017 183.522l-52.096 190.229 194.665-51.047c53.636 29.244 114.022 44.656 175.482 44.682h.151c202.382 0 367.128-164.688 367.21-367.094.039-98.087-38.121-190.319-107.452-259.706zM523.544 808.047h-.125c-54.767-.021-108.483-14.729-155.344-42.529l-11.146-6.612-115.517 30.293 30.834-112.592-7.259-11.544c-30.552-48.579-46.688-104.729-46.664-162.379.066-168.229 136.985-305.096 305.339-305.096 81.521.031 158.154 31.811 215.779 89.482s89.342 134.332 89.312 215.859c-.066 168.243-136.984 305.118-305.209 305.118zm167.415-228.515c-9.177-4.591-54.286-26.782-62.697-29.843-8.41-3.062-14.526-4.592-20.645 4.592-6.115 9.182-23.699 29.843-29.053 35.964-5.352 6.122-10.704 6.888-19.879 2.296-9.176-4.591-38.74-14.277-73.786-45.526-27.275-24.319-45.691-54.359-51.043-63.543-5.352-9.183-.569-14.146 4.024-18.72 4.127-4.109 9.175-10.713 13.763-16.069 4.587-5.355 6.117-9.183 9.175-15.304 3.059-6.122 1.529-11.479-.765-16.07-2.293-4.591-20.644-49.739-28.29-68.104-7.447-17.886-15.013-15.466-20.645-15.747-5.346-.266-11.469-.322-17.585-.322s-16.057 2.295-24.467 11.478-32.113 31.374-32.113 76.521c0 45.147 32.877 88.764 37.465 94.885 4.588 6.122 64.699 98.771 156.741 138.502 21.892 9.45 38.982 15.094 52.308 19.322 21.98 6.979 41.982 5.995 57.793 3.634 17.628-2.633 54.284-22.189 61.932-43.615 7.646-21.427 7.646-39.791 5.352-43.617-2.294-3.826-8.41-6.122-17.585-10.714z"></path></g></svg>`;

export function buildAssessmentCardEmail(data: AssessmentCandidateData) {
  const trackingId = data.trackingId || 'mygo' + Math.floor(100000 + Math.random() * 900000);
  const fullName = data.fullName || 'Valued Candidate';
  const age = data.age || 'Eligible';
  const passportNumber = data.passportNumber || 'ON FILE';
  const score = data.score || 96;
  const country = data.matchedCountry || 'Poland (Schengen Zone)';
  const jobTitle = data.matchedJobTitle || 'European Logistics & Operations Associate';
  const processingTime = data.matchedProcessingTime || '3–4 months';

  const countryLower = country.toLowerCase();
  let flagEmoji = '🇪🇺';
  for (const [key, emoji] of Object.entries(countryFlagMap)) {
    if (countryLower.includes(key)) {
      flagEmoji = emoji;
      break;
    }
  }

  const attachments: Array<{
    filename: string;
    content: Buffer;
    cid: string;
    contentType: string;
  }> = [];

  // 1. Brand Logo CID attachment
  const brandLogoPath = path.resolve(process.cwd(), 'Mygo_Travel_Logo.png');
  const brandLogoCid = 'mygologo@mygotravel.eu';
  let hasBrandLogo = false;
  try {
    if (fs.existsSync(brandLogoPath)) {
      attachments.push({
        filename: 'Mygo_Travel_Logo.png',
        content: fs.readFileSync(brandLogoPath),
        cid: brandLogoCid,
        contentType: 'image/png'
      });
      hasBrandLogo = true;
    }
  } catch (err) {
    console.warn('Brand logo attachment check:', err);
  }

  // 2. Candidate Photo (if available)
  let hasCustomPhoto = false;
  const photoCid = `candidate-photo-${trackingId}@mygotravel.eu`;
  if (data.photoData && data.photoData.startsWith('data:image/')) {
    try {
      const parts = data.photoData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (parts && parts[2]) {
        const contentType = parts[1] || 'image/jpeg';
        const buffer = Buffer.from(parts[2], 'base64');
        attachments.push({
          filename: `candidate_${trackingId}.jpg`,
          content: buffer,
          cid: photoCid,
          contentType
        });
        hasCustomPhoto = true;
      }
    } catch (e) {
      console.warn('Failed to parse candidate photo attachment:', e);
    }
  }

  // 3. NicerApp Logo
  const nicerappLogoPath = path.resolve(process.cwd(), 'nicerapplogo.png');
  const nicerappCid = 'nicerapplogo@mygotravel.eu';
  let hasNicerappLogo = false;
  try {
    if (fs.existsSync(nicerappLogoPath)) {
      attachments.push({
        filename: 'nicerapplogo.png',
        content: fs.readFileSync(nicerappLogoPath),
        cid: nicerappCid,
        contentType: 'image/png'
      });
      hasNicerappLogo = true;
    }
  } catch (err) {
    console.warn('NicerApp logo check:', err);
  }

  // 4. WhatsApp SVG Icon
  const whatsappCid = 'whatsappicon@mygotravel.eu';
  attachments.push({
    filename: 'whatsapp-icon.svg',
    content: Buffer.from(WHATSAPP_SVG, 'utf-8'),
    cid: whatsappCid,
    contentType: 'image/svg+xml'
  });

  const whatsappMessage = `Hi MyGo Travel, I have completed my European Relocation Assessment.\n\n` +
    `Candidate Name: ${fullName}\n` +
    `Tracking Reference: ${trackingId}\n` +
    `Recommended Destination: ${country}\n` +
    `Recommended Job: ${jobTitle}\n` +
    `Processing Time: ${processingTime}\n` +
    `Accommodation & Meals: Included\n` +
    `Work Authorization: Legal Sponsorship`;

  const whatsappUrl = `https://wa.me/12099493346?text=${encodeURIComponent(whatsappMessage)}`;
  const nicerappUrl = `https://nicerapp.cloud/invite/cd0452e9-e0be-4f0d-9fde-2aaa865c4e01`;

  const subject = `Eligibility Confirmed: Candidate Evaluation Card [Ref: ${trackingId}]`;

  const text = `
MYGO TRAVEL - CANDIDATE EVALUATION CARD
Reference ID: ${trackingId}

Dear ${fullName},

We are pleased to confirm that you are eligible for European employment and relocation. Here is your official Evaluation Card with your matched placement details.

CANDIDATE DOSSIER:
- Full Name: ${fullName}
- Reference ID: ${trackingId}
- Age: ${age}
- Passport / ID: ${passportNumber}
- Assessment Status: Confirmed Eligible (${score}% Match Index)

PLACEMENT & SPONSORSHIP DETAILS:
- Destination Country: ${country}
- Matched Role: ${jobTitle}
- Estimated Processing Time: ${processingTime}
- Work Authorization: Official Legal Sponsorship
- Housing Provision: Guaranteed Employer-Provided
- Daily Meals: Included Daily Provision

NEXT STEPS:
Please connect directly with your assigned placement desk quoting Reference ID ${trackingId}:
- WhatsApp Desk: ${whatsappUrl}
- Contact us on nicerapp: ${nicerappUrl}

Best regards,
MyGo Travel European Admissions Directorate
Email: network@mygotravel.eu
Website: https://mygotravel.eu
`.trim();

  const brandHeaderHtml = hasBrandLogo
    ? `<img src="cid:${brandLogoCid}" alt="MyGo Travel" height="34" style="height:34px; max-height:34px; width:auto; display:block;" />`
    : `<div style="font-size:22px; font-weight:800; color:#0f172a; font-family:Helvetica, Arial, sans-serif;">MyGo <span style="color:#f97316;">Travel</span></div>`;

  const photoHtml = hasCustomPhoto
    ? `<img src="cid:${photoCid}" alt="${fullName}" width="72" height="90" style="width:72px; height:90px; object-fit:cover; border-radius:6px; display:block; border:1px solid #cbd5e1;" />`
    : `<div style="width:72px; height:90px; background-color:#f1f5f9; border-radius:6px; border:1px solid #cbd5e1; text-align:center; line-height:90px; font-size:28px; color:#64748b;">👤</div>`;

  const nicerappIconHtml = hasNicerappLogo
    ? `<img src="cid:${nicerappCid}" width="20" height="20" alt="NicerApp" style="width:20px; height:20px; border-radius:50%; vertical-align:middle; margin-right:8px; display:inline-block;" />`
    : `<span style="font-size:15px; vertical-align:middle; margin-right:8px;">💬</span>`;

  const whatsappIconHtml = `<img src="cid:${whatsappCid}" width="20" height="20" alt="WhatsApp" style="width:20px; height:20px; vertical-align:middle; margin-right:8px; display:inline-block;" />`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Candidate Evaluation Card - ${trackingId}</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased; color:#1e293b;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc; padding:32px 16px;">
    <tr>
      <td align="center">
        
        <!-- Main Document Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px; background-color:#ffffff; border-radius:12px; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); overflow:hidden;">
          
          <!-- Top Clean Header Bar -->
          <tr>
            <td style="padding:24px 32px; border-bottom:1px solid #e2e8f0; background-color:#ffffff;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    ${brandHeaderHtml}
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <div style="font-size:11px; text-transform:uppercase; font-weight:700; letter-spacing:0.5px; color:#0f766e;">
                      ✓ Eligibility Confirmed
                    </div>
                    <div style="font-size:11px; color:#64748b; margin-top:2px;">
                      European Relocation Directorate
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Confirmation Body Message -->
          <tr>
            <td style="padding:28px 32px 20px 32px;">
              <h1 style="margin:0 0 12px 0; font-size:20px; font-weight:700; color:#0f172a; line-height:1.4;">
                Eligibility Confirmation: Candidate Evaluation Card
              </h1>
              <p style="margin:0 0 14px 0; font-size:14px; line-height:1.6; color:#334155;">
                Dear <strong>${fullName}</strong>,
              </p>
              <p style="margin:0 0 16px 0; font-size:14px; line-height:1.6; color:#334155;">
                We are pleased to confirm that you are <strong>eligible</strong> for European employment and relocation. Your assessment dossier has been matched with verified employer vacancies in our European partner network.
              </p>
              <p style="margin:0; font-size:14px; line-height:1.6; color:#334155;">
                Here is your official <strong>Candidate Evaluation Card</strong>:
              </p>
            </td>
          </tr>

          <!-- THE AUTHENTIC CANDIDATE EVALUATION CARD -->
          <tr>
            <td style="padding:0 32px 24px 32px;">
              
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff; border:1px solid #cbd5e1; border-top:3px solid #0f172a; border-radius:8px; overflow:hidden;">
                
                <!-- Card Meta Bar -->
                <tr>
                  <td style="padding:12px 18px; background-color:#f8fafc; border-bottom:1px solid #e2e8f0;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" style="vertical-align:middle;">
                          <span style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#334155;">
                            Evaluation Dossier
                          </span>
                        </td>
                        <td align="right" style="vertical-align:middle;">
                          <span style="font-size:11px; color:#64748b; margin-right:4px;">Ref:</span>
                          <span style="font-family:Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size:12px; font-weight:700; color:#0f172a; background-color:#e2e8f0; padding:2px 8px; border-radius:4px;">${trackingId}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Candidate Portrait & Core Info -->
                <tr>
                  <td style="padding:18px 20px 14px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="82" style="vertical-align:top;">
                          ${photoHtml}
                        </td>
                        <td style="vertical-align:top; padding-left:14px;">
                          <div style="font-size:17px; font-weight:700; color:#0f172a; margin-bottom:4px;">
                            ${fullName}
                          </div>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="font-size:12px; color:#475569; margin-bottom:8px;">
                            <tr>
                              <td style="padding-right:12px;">Age: <strong style="color:#1e293b;">${age}</strong></td>
                              <td>Passport: <strong style="color:#1e293b; font-family:monospace;">${passportNumber}</strong></td>
                            </tr>
                          </table>
                          <div style="display:inline-block; padding:4px 10px; background-color:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; font-size:11px; font-weight:700; color:#065f46;">
                            ✓ Status: Eligible (${score}% Match Index)
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Structured Placement Details Table -->
                <tr>
                  <td style="padding:0 20px 16px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; border-top:1px solid #e2e8f0; font-size:13px;">
                      
                      <tr>
                        <td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#64748b; font-weight:600; width:45%;">
                          Recommended Country
                        </td>
                        <td align="right" style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#0f172a; font-weight:700;">
                          ${flagEmoji} ${country}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#64748b; font-weight:600;">
                          Matched Position
                        </td>
                        <td align="right" style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#0f172a; font-weight:600;">
                          ${jobTitle}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#64748b; font-weight:600;">
                          Estimated Processing
                        </td>
                        <td align="right" style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#0f172a; font-weight:600;">
                          ${processingTime}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#64748b; font-weight:600;">
                          Work Authorization
                        </td>
                        <td align="right" style="padding:10px 0; border-bottom:1px solid #f1f5f9; color:#0f766e; font-weight:700;">
                          Official Legal Sponsorship
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:10px 0; color:#64748b; font-weight:600;">
                          Relocation Amenities
                        </td>
                        <td align="right" style="padding:10px 0; color:#0f172a; font-weight:600;">
                          Housing & Daily Meals Included
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>

                <!-- Verification Sub-Footer inside Card -->
                <tr>
                  <td style="padding:10px 20px; background-color:#f8fafc; border-top:1px solid #e2e8f0; font-size:11px; color:#64748b; text-align:center;">
                    Verified by European Admissions & Placement Directorate • Ref: <strong>${trackingId}</strong>
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- Contact Advisor / Action Buttons -->
          <tr>
            <td style="padding:0 32px 32px 32px; text-align:center;">
              
              <div style="font-size:14px; font-weight:700; color:#0f172a; margin-bottom:6px;">
                Ready to proceed with your relocation?
              </div>
              <p style="margin:0 0 20px 0; font-size:13px; line-height:1.5; color:#64748b;">
                Your file has been queued for document preparation. Please contact our desk quoting Reference ID <strong>${trackingId}</strong>:
              </p>

              <!-- Action Buttons Table -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="${whatsappUrl}" target="_blank" style="display:inline-block; width:88%; max-width:300px; background-color:#25D366; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:8px; font-size:14px; font-weight:700; text-align:center; vertical-align:middle;">
                      ${whatsappIconHtml}
                      <span style="vertical-align:middle;">Chat on WhatsApp</span>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${nicerappUrl}" target="_blank" style="display:inline-block; width:88%; max-width:300px; background-color:#1e40af; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:8px; font-size:14px; font-weight:700; text-align:center; vertical-align:middle;">
                      ${nicerappIconHtml}
                      <span style="vertical-align:middle;">Contact us on nicerapp</span>
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Official Institutional Footer -->
          <tr>
            <td style="padding:24px 32px; background-color:#f8fafc; border-top:1px solid #e2e8f0; text-align:center; font-size:11px; line-height:1.6; color:#64748b;">
              <p style="margin:0 0 6px 0; font-weight:600; color:#475569;">
                MyGo Travel European Relocation Services
              </p>
              <p style="margin:0 0 8px 0;">
                Official Inquiries: <a href="mailto:network@mygotravel.eu" style="color:#0284c7; text-decoration:none; font-weight:600;">network@mygotravel.eu</a> • Ref: <strong>${trackingId}</strong>
              </p>
              <p style="margin:0 0 10px 0; color:#94a3b8; font-size:10px;">
                Admissions Directorate: Warsaw • Prague • Bratislava • Lisbon • Vilnius
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

  return {
    subject,
    text,
    html,
    attachments
  };
}
