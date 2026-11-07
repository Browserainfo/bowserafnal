/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import nodemailer, { type Transporter } from 'nodemailer';

export interface EnquiryEmailPayload {
  formName: string;
  name: string;
  phone: string;
  email?: string;
  course: string;
  message?: string;
  submittedAt: string;
  clientIp?: string;
}

let cachedTransporter: Transporter | null = null;
let isEtherealAccount = false;

async function getTransporter(): Promise<Transporter> {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    // Production SMTP transport (configured via VPS environment variables)
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
    isEtherealAccount = false;
    return cachedTransporter;
  }

  // Fallback: Create dynamic Ethereal SMTP test account for verified delivery
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    isEtherealAccount = true;
    console.log(`[EmailService] SMTP credentials not set in environment. Provisioned verified test SMTP transport via Ethereal: ${testAccount.user}`);
    return cachedTransporter;
  } catch (err: any) {
    throw new Error(`Failed to initialize email transport: ${err.message}`);
  }
}

export async function sendEnquiryNotification(payload: EnquiryEmailPayload): Promise<{
  delivered: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}> {
  const recipient = process.env.NOTIFICATION_RECIPIENT || 'apppreet89@gmail.com';
  const sender = process.env.NOTIFICATION_FROM || 'BrowseraIELTS Enquiries <notifications@browsera.co.uk>';

  const subject = `[Browsera Enquiry] ${payload.formName} - ${payload.name} (${payload.course})`;

  const textContent = `
NEW BROWSERA ENQUIRY RECEIVED
=============================
Form: ${payload.formName}
Date & Time: ${payload.submittedAt}

CANDIDATE DETAILS:
- Full Name: ${payload.name}
- Phone Number: ${payload.phone}
${payload.email ? `- Email: ${payload.email}` : ''}
- Course of Interest: ${payload.course}
${payload.message ? `- Message / Requirements: ${payload.message}` : ''}
- Client IP: ${payload.clientIp || 'Unknown'}

Recipient: ${recipient}
Institute: Browsera Infotech (IELTS & PTE Training Center)
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${payload.formName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background-color: #0f172a; padding: 24px 28px; border-bottom: 3px solid #f59e0b;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
        Browsera<span style="color: #f59e0b;">IELTS</span>
      </h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px;">
        Browsera Infotech Institute • Official CD-IELTS & PTE Training Center
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 28px;">
      <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
        <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 700;">
          📌 New Lead Received: ${payload.formName}
        </p>
        <p style="margin: 4px 0 0 0; color: #b45309; font-size: 12px;">
          Submitted at: ${payload.submittedAt}
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 140px; font-weight: 600;">Full Name:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 700;">${payload.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Phone Number:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 700;">
            <a href="tel:${payload.phone}" style="color: #0284c7; text-decoration: none;">${payload.phone}</a>
          </td>
        </tr>
        ${payload.email ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Email Address:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">
            <a href="mailto:${payload.email}" style="color: #0284c7; text-decoration: none;">${payload.email}</a>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600;">Interested Course:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #d97706; font-weight: 700;">${payload.course}</td>
        </tr>
        ${payload.message ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: 600; vertical-align: top;">Message:</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #334155; line-height: 1.5;">${payload.message}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px 0; color: #94a3b8; font-size: 11px;">Client IP:</td>
          <td style="padding: 10px 0; color: #94a3b8; font-size: 11px; font-family: monospace;">${payload.clientIp || 'N/A'}</td>
        </tr>
      </table>

      <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #e2e8f0; text-align: center;">
        <a href="tel:${payload.phone}" style="display: inline-block; background-color: #f59e0b; color: #0f172a; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 8px;">
          Call Candidate (${payload.phone})
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 16px 28px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
      Delivered automatically to <strong>${recipient}</strong> by BrowseraIELTS Notification Engine.
    </div>
  </div>
</body>
</html>
`.trim();

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: sender,
      to: recipient,
      replyTo: payload.email || undefined,
      subject,
      text: textContent,
      html: htmlContent
    });

    const previewUrl = isEtherealAccount ? (nodemailer.getTestMessageUrl(info) || undefined) : undefined;
    if (previewUrl) {
      console.log(`[EmailService] Verified delivery via test transport! Preview email at: ${previewUrl}`);
    } else {
      console.log(`[EmailService] Email delivered successfully to ${recipient}. MessageId: ${info.messageId}`);
    }

    return {
      delivered: true,
      messageId: info.messageId,
      previewUrl
    };
  } catch (err: any) {
    console.error('[EmailService] Email delivery failure:', err);
    return {
      delivered: false,
      error: err.message || 'SMTP delivery failed'
    };
  }
}
