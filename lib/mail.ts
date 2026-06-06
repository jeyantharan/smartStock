import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP credentials are not configured. Check your .env.local file.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function getFromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || "Smart Stock";
}

function getAppUrl() {
  return process.env.APP_URL || "http://localhost:3000";
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${getAppUrl()}/verify-email?token=${token}`;
  const transporter = getTransporter();

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: "Verify your Smart Stock account",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0d6efd; margin: 0;">SMART<span style="color: #333;">STOCK</span></h1>
          </div>
          <h2 style="color: #333;">Hi ${name},</h2>
          <p>Thanks for signing up! Please verify your email address to activate your account.</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}"
               style="background: #0d6efd; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 14px; word-break: break-all; color: #0d6efd;">${verifyUrl}</p>
          <p style="font-size: 14px; color: #999; margin-top: 32px; border-top: 1px solid #eee; padding-top: 16px;">
            This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </body>
      </html>
    `,
    text: `Hi ${name},\n\nVerify your Smart Stock account by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
  });
}
