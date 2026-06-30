import nodemailer from "nodemailer";
import { Resend } from "resend";

interface EmailMemberPayload {
  id: string;
  full_name: string;
  email: string;
  codator_id: string;
}

/**
 * Helper to send email via Resend or SMTP, with a console fallback.
 */
async function sendMailHelper(to: string, subject: string, htmlContent: string) {
  // 1. Try Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
      
      const { data, error } = await resend.emails.send({
        from: `CODATOR <${fromEmail}>`,
        to,
        subject,
        html: htmlContent,
      });

      if (error) {
        console.error("Resend API error (falling back to SMTP if configured):", error);
      } else {
        console.log(`Email successfully sent via Resend to ${to}`);
        return true;
      }
    } catch (err) {
      console.error("Failed to send email via Resend (falling back to SMTP if configured):", err);
    }
  }

  // 2. Try SMTP
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  ) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"CODATOR" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent,
      });

      console.log(`Email successfully sent via SMTP to ${to}`);
      return true;
    } catch (err) {
      console.error("Failed to send email via SMTP:", err);
    }
  }

  // 3. Fallback: Log to console
  console.log("\n--- [EMAIL OUTBOX FALLBACK] ---");
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log("BODY (HTML PREVIEW):");
  console.log(htmlContent);
  console.log("--------------------------------\n");
  return true;
}

/**
 * Generates the HTML welcome email template.
 */
function getWelcomeEmailHtml(member: EmailMemberPayload, siteUrl: string): string {
  const portalUrl = `${siteUrl}/login`;
  const passImageUrl = `${siteUrl}/api/pass/${member.id}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to CODATOR</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #FAFAFC;
          color: #1C1B29;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border: 1px solid #E8E7F0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
          background: linear-gradient(135deg, #8B7FE8 0%, #5B8DEF 100%);
          padding: 30px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 2px;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
        }
        .content h2 {
          color: #1C1B29;
          font-size: 20px;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .content p {
          color: #4B4958;
          font-size: 14px;
          margin-bottom: 15px;
        }
        .id-box {
          background-color: #F4F3F8;
          border: 1px dashed #D5D3E5;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 25px 0;
        }
        .id-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #8B7FE8;
        }
        .id-value {
          font-size: 24px;
          font-weight: 900;
          font-family: monospace;
          color: #1C1B29;
          margin-top: 5px;
        }
        .btn {
          display: inline-block;
          background: #8B7FE8;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 750;
          margin: 20px 0;
        }
        .footer {
          background-color: #F9F9FB;
          padding: 20px;
          border-top: 1px solid #E8E7F0;
          font-size: 11px;
          text-align: center;
          color: #8C8A9E;
        }
        .social-links {
          margin-top: 10px;
        }
        .social-links a {
          color: #8B7FE8;
          text-decoration: none;
          margin: 0 8px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CODATOR</h1>
        </div>
        <div class="content">
          <h2>Welcome to the Society, ${member.full_name}!</h2>
          <p>We are thrilled to inform you that your application for membership in CODATOR has been approved.</p>
          <p>You are now officially a member of the university Computer Science & Computer Engineering society.</p>
          
          <div class="id-box">
            <div class="id-label">Your CODATOR ID</div>
            <div class="id-value">${member.codator_id}</div>
          </div>
          
          <p>Your digital member card and virtual event pass have been generated. To access your portal, please click the button below to activate your account (select the <b>Activate Account</b> tab and choose a password using this email address):</p>
          
          <div style="text-align: center;">
            <a href="${portalUrl}" class="btn">Activate Account & Login</a>
          </div>
          
          <p style="margin-top: 25px; font-size: 13px; color: #5B8DEF;">
            View your digital pass card: <a href="${passImageUrl}" target="_blank" style="color: #5B8DEF;">${passImageUrl}</a>
          </p>
        </div>
        <div class="footer">
          <p>This welcome email was sent to you as a registered member of CODATOR.</p>
          <div class="social-links">
            <a href="https://www.linkedin.com/company/codator1/posts/">LinkedIn</a> •
            <a href="https://www.instagram.com/codator.cse/">Instagram</a> •
            <a href="https://www.facebook.com/share/18j85P8K6r/">Facebook</a>
          </div>
          <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} CODATOR. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates the HTML custom broadcast email template.
 */
function getCustomEmailHtml(title: string, body: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CODATOR Announcement</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #FAFAFC;
          color: #1C1B29;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border: 1px solid #E8E7F0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
          background: linear-gradient(135deg, #8B7FE8 0%, #5B8DEF 100%);
          padding: 25px;
          text-align: center;
          color: #ffffff;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 2px;
        }
        .content {
          padding: 35px 30px;
          line-height: 1.6;
        }
        .content h2 {
          color: #1C1B29;
          font-size: 18px;
          margin-top: 0;
          margin-bottom: 15px;
          border-bottom: 1px solid #F4F3F8;
          padding-bottom: 10px;
        }
        .content p {
          color: #4B4958;
          font-size: 14px;
          margin-bottom: 15px;
          white-space: pre-line;
        }
        .footer {
          background-color: #F9F9FB;
          padding: 20px;
          border-top: 1px solid #E8E7F0;
          font-size: 11px;
          text-align: center;
          color: #8C8A9E;
        }
        .social-links {
          margin-top: 10px;
        }
        .social-links a {
          color: #8B7FE8;
          text-decoration: none;
          margin: 0 8px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CODATOR</h1>
        </div>
        <div class="content">
          <h2>${title}</h2>
          <p>${body}</p>
        </div>
        <div class="footer">
          <p>This is an official announcement from CODATOR.</p>
          <div class="social-links">
            <a href="https://www.linkedin.com/company/codator1/posts/">LinkedIn</a> •
            <a href="https://www.instagram.com/codator.cse/">Instagram</a> •
            <a href="https://www.facebook.com/share/18j85P8K6r/">Facebook</a>
          </div>
          <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} CODATOR. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generates the HTML event invitation email template.
 */
function getEventInvitationHtml(eventName: string, eventDate: string, eventLocation: string, eventDesc: string, siteUrl: string): string {
  const portalUrl = `${siteUrl}/login`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Event Invitation - ${eventName}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #FAFAFC;
          color: #1C1B29;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border: 1px solid #E8E7F0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
          background: linear-gradient(135deg, #1D1B26 0%, #312E43 100%);
          padding: 30px;
          text-align: center;
          color: #ffffff;
          border-bottom: 3px solid #8B7FE8;
        }
        .header h1 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #8B7FE8;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .header h2 {
          margin: 10px 0 0 0;
          font-size: 24px;
          font-weight: 900;
          color: #ffffff;
        }
        .content {
          padding: 35px 30px;
          line-height: 1.6;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background-color: #F4F3F8;
          border-radius: 8px;
          overflow: hidden;
        }
        .details-table td {
          padding: 15px;
          border-bottom: 1px solid #E8E7F0;
          font-size: 13px;
          color: #1C1B29;
        }
        .details-table td.label {
          font-weight: bold;
          color: #8B7FE8;
          width: 100px;
        }
        .content p {
          color: #4B4958;
          font-size: 14px;
          margin-bottom: 15px;
        }
        .btn-container {
          text-align: center;
          margin: 30px 0;
        }
        .btn {
          display: inline-block;
          background: #8B7FE8;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 750;
        }
        .footer {
          background-color: #F9F9FB;
          padding: 20px;
          border-top: 1px solid #E8E7F0;
          font-size: 11px;
          text-align: center;
          color: #8C8A9E;
        }
        .social-links {
          margin-top: 10px;
        }
        .social-links a {
          color: #8B7FE8;
          text-decoration: none;
          margin: 0 8px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Event Invitation</h1>
          <h2>${eventName}</h2>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>You are cordially invited to attend our upcoming event. Here are the details:</p>
          
          <table class="details-table">
            <tr>
              <td class="label">Date & Time</td>
              <td>${eventDate}</td>
            </tr>
            <tr>
              <td class="label">Location</td>
              <td>${eventLocation}</td>
            </tr>
          </table>
          
          <p style="white-space: pre-line;">${eventDesc}</p>
          
          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Register & View Details</a>
          </div>
        </div>
        <div class="footer">
          <p>This invitation was sent to you as a registered member of CODATOR.</p>
          <div class="social-links">
            <a href="https://www.linkedin.com/company/codator1/posts/">LinkedIn</a> •
            <a href="https://www.instagram.com/codator.cse/">Instagram</a> •
            <a href="https://www.facebook.com/share/18j85P8K6r/">Facebook</a>
          </div>
          <p style="margin-top: 15px;">&copy; ${new Date().getFullYear()} CODATOR. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends a welcome email to a newly approved member.
 */
export async function sendWelcomeEmail(member: EmailMemberPayload) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const htmlContent = getWelcomeEmailHtml(member, siteUrl);
  return sendMailHelper(member.email, "Welcome to CODATOR — Your membership is confirmed", htmlContent);
}

/**
 * Sends a custom announcement email to a member.
 */
export async function sendCustomEmail(to: string, subject: string, title: string, body: string) {
  const htmlContent = getCustomEmailHtml(title, body);
  return sendMailHelper(to, subject, htmlContent);
}

/**
 * Sends an event invitation email to a member.
 */
export async function sendInvitationEmail(to: string, eventName: string, eventDate: string, eventLocation: string, eventDesc: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const htmlContent = getEventInvitationHtml(eventName, eventDate, eventLocation, eventDesc, siteUrl);
  return sendMailHelper(to, `Invitation: ${eventName} | CODATOR`, htmlContent);
}
