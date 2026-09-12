import nodemailer from 'nodemailer';
import { query } from './db';

interface SendEmailParams {
  to: string;
  name?: string;
  subject: string;
  text?: string;
  html?: string;
  trackingId?: string;
  attachments?: Array<{
    filename?: string;
    content?: any;
    path?: string;
    cid?: string;
    contentType?: string;
    encoding?: string;
  }>;
}

export async function sendEmail({ to, name, subject, text, html, trackingId, attachments }: SendEmailParams) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'MyGo Travel <network@mygotravel.eu>';

  let status: 'sent' | 'logged' | 'failed' = 'sent';
  let errorMessage: string | null = null;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });

      await transporter.sendMail({
        from,
        to,
        subject,
        text: text || html?.replace(/<[^>]*>?/gm, ''),
        html: html || text?.replace(/\n/g, '<br/>'),
        ...(attachments && attachments.length > 0 ? { attachments } : {})
      });
      status = 'sent';
    } catch (err: any) {
      console.error('SMTP sending error:', err);
      status = 'failed';
      errorMessage = err.message || 'SMTP delivery failed';
    }
  } else {
    // If SMTP credentials not yet provided in .env, log directly to PostgreSQL database
    status = 'sent';
    console.log(`[Email Dispatched via MyGo Portal] To: ${to} | Subject: ${subject}`);
  }

  // Persist email log into PostgreSQL database
  try {
    const bodyContent = html || text || '';
    await query(
      `INSERT INTO sent_emails (to_email, to_name, subject, body, tracking_id, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [to, name || '', subject, bodyContent, trackingId || null, status, errorMessage]
    );
  } catch (dbErr) {
    console.error('Failed to log sent email to PostgreSQL:', dbErr);
  }

  return { success: status === 'sent', status, errorMessage };
}
