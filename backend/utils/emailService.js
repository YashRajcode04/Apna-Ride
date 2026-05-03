import nodemailer from 'nodemailer';

// ===== EMAIL TRANSPORTER CONFIGURATION =====
const createTransporter = () => {
  // For production, use your SMTP service (Gmail, SendGrid, AWS SES, etc.)
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // For development, use Ethereal (test email service)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER || 'your-ethereal-user',
      pass: process.env.ETHEREAL_PASS || 'your-ethereal-pass',
    },
  });
};

// ===== SEND VERIFICATION EMAIL =====
export const sendVerificationEmail = async (user, verificationToken) => {
  const transporter = createTransporter();
  
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  
  const mailOptions = {
    from: `"Apna Ride" <${process.env.FROM_EMAIL || 'noreply@apnaride.com'}>`,
    to: user.email,
    subject: '🚗 Verify Your Apna Ride Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Apna Ride! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${user.name}</strong>,</p>
              <p>Thank you for signing up! Please verify your email address to activate your account and start renting premium cars.</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p style="color: #666; font-size: 14px;">Or copy this link to your browser:</p>
              <p style="word-break: break-all; color: #0066cc; font-size: 12px;">${verificationUrl}</p>
              <p><strong>This link expires in 24 hours.</strong></p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Apna Ride. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send verification email');
  }
};

// ===== SEND PASSWORD RESET EMAIL =====
export const sendPasswordResetEmail = async (user, resetToken) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"Apna Ride" <${process.env.FROM_EMAIL || 'noreply@apnaride.com'}>`,
    to: user.email,
    subject: '🔐 Reset Your Apna Ride Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${user.name}</strong>,</p>
              <p>We received a request to reset your password for your Apna Ride account.</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="color: #666; font-size: 14px;">Or copy this link to your browser:</p>
              <p style="word-break: break-all; color: #0066cc; font-size: 12px;">${resetUrl}</p>
              <div class="alert">
                <strong>⚠️ Security Notice:</strong> This link expires in 1 hour for your security.
              </div>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} Apna Ride. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send password reset email');
  }
};

// ===== SEND OTP EMAIL =====
export const sendOTPEmail = async (user, otp) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Apna Ride" <${process.env.FROM_EMAIL || 'noreply@apnaride.com'}>`,
    to: user.email,
    subject: '🔑 Your Apna Ride Login OTP',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #000; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; margin: 20px 0; border-radius: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Your Login Code</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${user.name}</strong>,</p>
              <p>Your one-time password (OTP) for logging into Apna Ride:</p>
              <div class="otp-box">${otp}</div>
              <p style="text-align: center; color: #dc3545; font-weight: bold;">⏱️ Valid for 10 minutes only</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; color: #666;">If you didn't request this OTP, please secure your account immediately.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send OTP email');
  }
};

// ===== SEND WELCOME EMAIL (after verification) =====
export const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Apna Ride" <${process.env.FROM_EMAIL || 'noreply@apnaride.com'}>`,
    to: user.email,
    subject: '🎉 Welcome to Apna Ride!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #000; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Welcome Aboard!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${user.name}</strong>,</p>
              <p>Your account is now verified! Get ready to experience premium car rentals.</p>
              <h3>What's Next?</h3>
              <div class="feature">✅ Browse our fleet of premium cars</div>
              <div class="feature">📅 Book your first ride with special discounts</div>
              <div class="feature">🎁 Refer friends and earn rewards</div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/cars" style="display: inline-block; padding: 15px 30px; background: #000; color: white; text-decoration: none; border-radius: 5px;">Browse Cars</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent');
  } catch (error) {
    console.error('❌ Welcome email error:', error);
  }
};
