/**
 * UX Collective — backend/lib/mailer.js
 * Author: Md Shahed
 * Date: 2026-10-23
 */
import nodemailer from 'nodemailer';

// Outgoing email (calendar invites, subscription confirmations).
// Configure with SMTP_* env vars; when they are missing, emails are logged instead of sent.

const config = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from: process.env.MAIL_FROM || process.env.SMTP_USER || 'usaskuxcollective@ussu.ca',
};

export const mailConfigured = !!(config.host && config.user && config.pass);
export const mailFrom = config.from;

const transport = mailConfigured
  ? nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
    })
  : null;

export async function sendMail({ to, subject, text, html, icalEvent }) {
  if (!transport) {
    console.log(`[mail disabled] Would send "${subject}" to ${to}`);
    return { skipped: true };
  }
  return transport.sendMail({ from: `"UX Collective" <${config.from}>`, to, subject, text, html, icalEvent });
}

// Extracts the bare address from MAIL_FROM for use as the invite organizer.
export const organizerAddress = () => (config.from.match(/<([^>]+)>/)?.[1] || config.from).trim();
