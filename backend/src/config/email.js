const nodemailer = require('nodemailer');

/**
 * Email Configuration
 * Configure email transport using Gmail or custom SMTP
 */

// Create reusable transporter
const createTransporter = () => {
  // If email is not configured, return a mock transporter
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  Email not configured. Emails will not be sent.');
    return {
      verify: async () => false,
      sendMail: async () => ({ messageId: 'mock-id' })
    };
  }

  // Use Gmail for development/testing
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      }
    });
  }

  // Use custom SMTP server for production
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

const transporter = createTransporter();

/**
 * Verify email configuration on startup
 */
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.warn('⚠️  Email service configuration issue:', error.message);
    console.warn('⚠️  Email notifications will not work. Please configure EMAIL_USER and EMAIL_PASSWORD in .env');
    return false;
  }
};

/**
 * Send email helper function
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'OnlyArts'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, '') // Strip HTML for plain text fallback
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Email Templates
 */

// Welcome email
const sendWelcomeEmail = async (userEmail, username) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8c52ff;">Welcome to OnlyArts!</h1>
      <p>Hi ${username},</p>
      <p>Thank you for joining OnlyArts, the premier platform for artists and art enthusiasts.</p>
      <p>Start exploring amazing artworks, connect with talented artists, and showcase your creativity!</p>
      <p>Best regards,<br/>The OnlyArts Team</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'Welcome to OnlyArts!',
    html
  });
};

// Password reset email
const sendPasswordResetEmail = async (userEmail, username, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8c52ff;">Password Reset Request</h1>
      <p>Hi ${username},</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #8c52ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br/>The OnlyArts Team</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'Reset Your Password - OnlyArts',
    html
  });
};

// Order confirmation email
const sendOrderConfirmationEmail = async (userEmail, username, order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8c52ff;">Order Confirmation</h1>
      <p>Hi ${username},</p>
      <p>Thank you for your purchase! Your order has been confirmed.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> #${order.id}</p>
        <p><strong>Total:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>
      <p>You can track your order status in your account dashboard.</p>
      <p>Best regards,<br/>The OnlyArts Team</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: `Order Confirmation #${order.id} - OnlyArts`,
    html
  });
};

// Commission request notification
const sendCommissionRequestEmail = async (artistEmail, artistName, clientName, commissionTitle) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8c52ff;">New Commission Request</h1>
      <p>Hi ${artistName},</p>
      <p>You have received a new commission request from ${clientName}.</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Project:</strong> ${commissionTitle}</p>
      </div>
      <p>Log in to your account to view the details and respond to the request.</p>
      <p>Best regards,<br/>The OnlyArts Team</p>
    </div>
  `;

  return await sendEmail({
    to: artistEmail,
    subject: 'New Commission Request - OnlyArts',
    html
  });
};

// New follower notification
const sendNewFollowerEmail = async (userEmail, username, followerName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8c52ff;">New Follower</h1>
      <p>Hi ${username},</p>
      <p><strong>${followerName}</strong> started following you on OnlyArts!</p>
      <p>Check out their profile and connect with them.</p>
      <p>Best regards,<br/>The OnlyArts Team</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'You have a new follower! - OnlyArts',
    html
  });
};

// Subscription confirmation email
const sendSubscriptionConfirmationEmail = async (userEmail, username, tierName, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #8c52ff;">Subscription Confirmed</h1>
      <p>Hi ${username},</p>
      <p>Your subscription to <strong>${tierName}</strong> has been confirmed!</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Plan:</strong> ${tierName}</p>
        <p><strong>Amount:</strong> $${parseFloat(amount).toFixed(2)}/month</p>
      </div>
      <p>Enjoy your premium features and exclusive content!</p>
      <p>Best regards,<br/>The OnlyArts Team</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject: 'Subscription Confirmed - OnlyArts',
    html
  });
};

module.exports = {
  transporter,
  verifyEmailConfig,
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendCommissionRequestEmail,
  sendNewFollowerEmail,
  sendSubscriptionConfirmationEmail
};
