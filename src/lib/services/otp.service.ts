/**
 * OTP Service
 * Handles OTP generation, validation, and sending
 * Single Responsibility: OTP operations
 */

import { db } from '../db';
import { OTPType, OTPCode } from '@prisma/client';
import { randomInt } from 'crypto';

// Environment variables
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6', 10);

export interface OTPResult {
  success: boolean;
  code?: string;
  error?: string;
}

/**
 * Generate a random OTP code
 */
export function generateOTPCode(length: number = OTP_LENGTH): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[randomInt(0, digits.length)];
  }
  return code;
}

/**
 * Create and store OTP
 */
export async function createOTP(
  userId: string,
  phone: string,
  type: OTPType
): Promise<OTPCode> {
  // Invalidate existing OTPs of same type for this user
  await db.oTPCode.updateMany({
    where: {
      userId,
      type,
      isUsed: false,
    },
    data: {
      isUsed: true,
    },
  });

  // Generate new OTP
  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store OTP
  return db.oTPCode.create({
    data: {
      userId,
      phone,
      code,
      type,
      expiresAt,
    },
  });
}

/**
 * Verify OTP
 */
export async function verifyOTP(
  phone: string,
  code: string,
  type: OTPType
): Promise<OTPResult> {
  const otpRecord = await db.oTPCode.findFirst({
    where: {
      phone,
      code,
      type,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!otpRecord) {
    return {
      success: false,
      error: 'رمز التحقق غير صالح أو منتهي الصلاحية',
    };
  }

  // Mark OTP as used
  await db.oTPCode.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  return {
    success: true,
    code: otpRecord.code,
  };
}

/**
 * Verify OTP and return user
 */
export async function verifyOTPAndGetUser(
  phone: string,
  code: string,
  type: OTPType
) {
  const otpRecord = await db.oTPCode.findFirst({
    where: {
      phone,
      code,
      type,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!otpRecord) {
    return null;
  }

  // Mark OTP as used
  await db.oTPCode.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  return otpRecord.user;
}

/**
 * Send OTP via WhatsApp (using Twilio)
 */
export async function sendOTPViaWhatsApp(phone: string, code: string): Promise<OTPResult> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio credentials not configured. OTP:', code);
      return { success: true, code };
    }

    const message = `رمز التحقق الخاص بك هو: ${code}\n\nهذا الرمز صالح لمدة ${OTP_EXPIRY_MINUTES} دقائق.`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: `whatsapp:${phone}`,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send WhatsApp message:', error);
      return {
        success: false,
        error: 'فشل في إرسال الرسالة',
      };
    }

    return { success: true, code };
  } catch (error) {
    console.error('Error sending OTP via WhatsApp:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء إرسال الرسالة',
    };
  }
}

/**
 * Send OTP via SMS (using Twilio)
 */
export async function sendOTPViaSMS(phone: string, code: string): Promise<OTPResult> {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER?.replace('whatsapp:', '');

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('Twilio credentials not configured. OTP:', code);
      return { success: true, code };
    }

    const message = `رمز التحقق: ${code} (صالح لمدة ${OTP_EXPIRY_MINUTES} دقائق)`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: phone,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send SMS:', error);
      return {
        success: false,
        error: 'فشل في إرسال الرسالة',
      };
    }

    return { success: true, code };
  } catch (error) {
    console.error('Error sending OTP via SMS:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء إرسال الرسالة',
    };
  }
}
