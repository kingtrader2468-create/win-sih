const nodemailer = require('nodemailer');

let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    return cachedTransporter;
  }

  // Development/Test fallback
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
    return cachedTransporter;
  } catch (err) {
    console.warn('Could not create Ethereal test mail account, using mock console logger:', err.message);
    cachedTransporter = {
      sendMail: async (mailOptions) => {
        console.log('--- [MOCK NODEMAILER EMAIL DISPATCH] ---');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Content:\n${mailOptions.text || mailOptions.html}`);
        console.log('----------------------------------------');
        return { messageId: `mock-${Date.now()}` };
      }
    };
    return cachedTransporter;
  }
}

/**
 * Send OTP verification code
 */
async function sendOtpEmail({ to, otp, purpose, name = 'Polar Scholar' }) {
  const isRegistration = purpose === 'registration';
  const subject = isRegistration
    ? `[Polar India Hub] Verification Code for Registration: ${otp}`
    : `[Polar India Hub] Password Reset Verification Code: ${otp}`;

  const purposeText = isRegistration
    ? 'creating your Sovereign Scholar ID on Polar India Hub'
    : 'resetting your Scholar Account password';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9ff; margin: 0; padding: 24px; color: #0b1c30; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #dce9ff; padding: 32px; box-shadow: 0 4px 16px rgba(11,31,51,0.06); }
        .header { border-bottom: 2px solid #eff4ff; padding-bottom: 20px; margin-bottom: 24px; text-align: center; }
        .logo-title { font-size: 20px; font-weight: 800; color: #00658f; letter-spacing: -0.01em; margin: 0; }
        .sub-title { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; margin-top: 4px; font-weight: 600; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .description { font-size: 14px; line-height: 1.6; color: #3e4850; margin-bottom: 24px; }
        .otp-box { background: linear-gradient(135deg, #eff4ff 0%, #dce9ff 100%); border: 1px solid #1ea7e8; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #00658f; display: inline-block; padding-left: 8px; }
        .otp-expiry { font-size: 12px; color: #64748b; margin-top: 8px; font-weight: 500; }
        .advisory { font-size: 12px; line-height: 1.5; color: #64748b; border-left: 3px solid #1ea7e8; padding-left: 12px; margin-top: 24px; }
        .footer { border-top: 1px solid #eff4ff; margin-top: 32px; padding-top: 16px; font-size: 11px; color: #8a99a8; text-align: center; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-title">POLAR INDIA HUB</h1>
          <div class="sub-title">National Centre for Polar and Ocean Research · Ministry of Earth Sciences</div>
        </div>
        <div class="greeting">Greetings, ${name}!</div>
        <p class="description">
          You have initiated a request for <strong>${purposeText}</strong>. Use the sovereign 6-digit authentication code below to verify your institutional identity:
        </p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="otp-expiry">Valid for 10 minutes (Single use only)</div>
        </div>
        <div class="advisory">
          <strong>Security Notice:</strong> Never share this code with anyone. NCPOR and MoES officials will never ask for your authentication code. If you did not request this code, you can safely disregard this email.
        </div>
        <div class="footer">
          National Centre for Polar and Ocean Research (NCPOR), Headland Sada, Vasco-da-Gama, Goa 403804, India.<br>
          Gateway to Antarctic, Arctic, and Himalayan Cryospheric Sciences.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Greetings ${name},\n\nYour Polar India Hub verification code for ${purposeText} is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this code, please ignore this email.\n\nNational Centre for Polar and Ocean Research (NCPOR), Goa`;

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Polar India Hub · NCPOR" <no-reply@polar-india-hub.gov.in>',
      to,
      subject,
      text,
      html
    });

    console.log(`[EmailService] OTP sent to ${to} (MessageId: ${info.messageId})`);
    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    if (previewUrl) console.log(`[EmailService] Preview URL: ${previewUrl}`);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl
    };
  } catch (err) {
    console.error(`[EmailService] Error sending email to ${to}:`, err.message);
    // Return gracefully with dev fallback
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Send Contact Us Confirmation Email
 */
async function sendContactConfirmationEmail({ to, name, subject, ticketId }) {
  const emailSubject = `[Polar India Hub] Inquiry Received · Reference #${ticketId}: ${subject}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9ff; margin: 0; padding: 24px; color: #0b1c30; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #dce9ff; padding: 32px; }
        .header { border-bottom: 2px solid #eff4ff; padding-bottom: 16px; margin-bottom: 20px; }
        .logo { font-size: 18px; font-weight: 800; color: #00658f; margin: 0; }
        .sub { font-size: 11px; text-transform: uppercase; color: #64748b; }
        .badge { display: inline-block; background: #e5eeff; color: #00658f; font-weight: 700; padding: 4px 10px; border-radius: 6px; font-size: 12px; margin: 12px 0; }
        .footer { border-top: 1px solid #eff4ff; margin-top: 24px; padding-top: 12px; font-size: 11px; color: #8a99a8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">POLAR INDIA HUB</h1>
          <div class="sub">National Centre for Polar and Ocean Research · Ministry of Earth Sciences</div>
        </div>
        <p>Dear ${name},</p>
        <p>Thank you for contacting the National Centre for Polar and Ocean Research (NCPOR). We have logged your scientific inquiry in our public portal dispatch queue.</p>
        <div class="badge">Reference ID: #${ticketId}</div>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>Our scientific coordination team or polar logistics desk will review your submission and reply back to this email address within 2 business days.</p>
        <p>Warm regards,<br><strong>Polar Secretariat &amp; Outreach Wing</strong><br>NCPOR, Goa, India</p>
        <div class="footer">NCPOR Headland Sada, Vasco-da-Gama, Goa 403804</div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Polar India Hub · NCPOR" <no-reply@polar-india-hub.gov.in>',
      to,
      subject: emailSubject,
      text: `Dear ${name},\n\nThank you for contacting NCPOR. Your inquiry #${ticketId} ("${subject}") has been registered with our team.\n\nWarm regards,\nPolar India Hub Team`,
      html
    });
    return { success: true };
  } catch (err) {
    console.warn('[EmailService] Contact confirmation email error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendOtpEmail,
  sendContactConfirmationEmail
};
