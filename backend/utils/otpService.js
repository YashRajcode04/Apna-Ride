import twilio from 'twilio';

// ===== TWILIO CLIENT CONFIGURATION =====
let twilioClient = null;

const initTwilioClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
};

// ===== SEND OTP VIA SMS =====
export const sendOTPviaSMS = async (phone, otp) => {
  try {
    const client = initTwilioClient();
    
    if (!client) {
      console.log('⚠️ Twilio not configured. OTP:', otp);
      // In development, just log the OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n📱 SMS OTP for ${phone}: ${otp}\n`);
        return { success: true, message: 'OTP logged (dev mode)' };
      }
      throw new Error('SMS service not configured');
    }
    
    const message = await client.messages.create({
      body: `Your Apna Ride verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    
    console.log('✅ SMS sent:', message.sid);
    return { success: true, sid: message.sid };
    
  } catch (error) {
    console.error('❌ SMS send error:', error.message);
    
    // Fallback to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📱 SMS OTP (fallback) for ${phone}: ${otp}\n`);
      return { success: true, message: 'OTP logged (fallback)' };
    }
    
    throw new Error('Failed to send SMS OTP');
  }
};

// ===== SEND OTP VIA WHATSAPP (optional) =====
export const sendOTPviaWhatsApp = async (phone, otp) => {
  try {
    const client = initTwilioClient();
    
    if (!client) {
      throw new Error('WhatsApp service not configured');
    }
    
    const message = await client.messages.create({
      body: `🚗 *Apna Ride Verification*\n\nYour OTP: *${otp}*\n\nValid for 10 minutes.\nDo not share this code.`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phone}`,
    });
    
    console.log('✅ WhatsApp sent:', message.sid);
    return { success: true, sid: message.sid };
    
  } catch (error) {
    console.error('❌ WhatsApp send error:', error.message);
    throw new Error('Failed to send WhatsApp OTP');
  }
};

// ===== VALIDATE PHONE NUMBER FORMAT =====
export const validatePhoneNumber = (phone) => {
  // Basic international phone number validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

// ===== GENERATE RANDOM OTP =====
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// ===== CHECK OTP RATE LIMIT =====
export const checkOTPRateLimit = (user) => {
  if (!user.otp || !user.otp.lastSentAt) {
    return { allowed: true };
  }
  
  const timeSinceLastOTP = Date.now() - new Date(user.otp.lastSentAt).getTime();
  const minInterval = 60 * 1000; // 1 minute between OTP requests
  
  if (timeSinceLastOTP < minInterval) {
    const remainingSeconds = Math.ceil((minInterval - timeSinceLastOTP) / 1000);
    return {
      allowed: false,
      message: `Please wait ${remainingSeconds} seconds before requesting a new OTP`,
      remainingSeconds,
    };
  }
  
  return { allowed: true };
};
