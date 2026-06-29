import nodemailer from "nodemailer";
import { Resend } from "resend";

interface EmailMemberPayload {
  id: string;
  full_name: string;
  email: string;
  codator_id: string;
}

/**
 * Generates the HTML welcome email template.
 */
function getWelcomeEmailHtml(member: EmailMemberPayload, siteUrl: string): string {
  const portalUrl = `${siteUrl}/portal`;
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
          background-color: #8B7FE8;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: #FAFAFC;
          margin: 0;
          font-size: 24px;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
        }
        .content h2 {
          font-size: 20px;
          margin-top: 0;
        }
        .id-box {
          background-color: #EDEAFB;
          border: 1px solid #E8E7F0;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          margin: 25px 0;
        }
        .id-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #5B8DEF;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .id-value {
          font-family: 'Courier New', Courier, monospace;
          font-size: 22px;
          font-weight: bold;
          color: #8B7FE8;
          letter-spacing: 1px;
        }
        .btn {
          display: inline-block;
          background-color: #8B7FE8;
          color: #FAFAFC !important;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          margin-top: 15px;
          text-align: center;
        }
        .btn:hover {
          background-color: #7A6ED7;
        }
        .footer {
          background-color: #FAFAFC;
          padding: 20px 30px;
          border-t: 1px solid #E8E7F0;
          font-size: 12px;
          color: #1C1B29;
          opacity: 0.5;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div className="container">
        <div className="header">
          <h1>CODATOR</h1>
        </div>
        <div className="content">
          <h2>Welcome to the Society, ${member.full_name}!</h2>
          <p>We are thrilled to inform you that your application for membership in CODATOR has been approved.</p>
          <p>You are now officially a member of the university Computer Science & Computer Engineering society.</p>
          
          <div className="id-box">
            <div className="id-label">Your CODATOR ID</div>
            <div className="id-value">${member.codator_id}</div>
          </div>
          
          <p>Your digital member card and virtual event pass have been generated. You can download your pass by clicking the button below or view it directly at the link below:</p>
          
          <div style="text-align: center;">
            <a href="${portalUrl}" className="btn">Go to Member Portal</a>
          </div>
          
          <p style="margin-top: 25px; font-size: 13px; color: #5B8DEF;">
            View your digital pass card: <a href="${passImageUrl}" target="_blank" style="color: #5B8DEF;">${passImageUrl}</a>
          </p>
        </div>
        <div className="footer">
          <p>&copy; ${new Date().getFullYear()} CODATOR. All rights reserved.</p>
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

  // 1. Try Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "CODATOR <noreply@codator.org>",
        to: member.email,
        subject: "Welcome to CODATOR — Your membership is confirmed",
        html: htmlContent,
      });
      console.log(`Welcome email successfully sent via Resend to ${member.email}`);
      return;
    } catch (err) {
      console.error("Failed to send email via Resend:", err);
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
        to: member.email,
        subject: "Welcome to CODATOR — Your membership is confirmed",
        html: htmlContent,
      });

      console.log(`Welcome email successfully sent via SMTP to ${member.email}`);
      return;
    } catch (err) {
      console.error("Failed to send email via SMTP:", err);
    }
  }

  // 3. Fallback: Log to console
  console.log("\n--- [EMAIL OUTBOX FALLBACK] ---");
  console.log(`TO: ${member.email}`);
  console.log("SUBJECT: Welcome to CODATOR — Your membership is confirmed");
  console.log(`MEMBER ID: ${member.codator_id}`);
  console.log("BODY (HTML PREVIEW):");
  console.log(htmlContent);
  console.log("--------------------------------\n");
}
