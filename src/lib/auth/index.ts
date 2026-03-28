// =============================================
// تصدير وحدات المصادقة
// Auth Modules Export
// =============================================

// JWT System
export {
  generateAccessToken,
  generateAccessTokenWithSession,
  generateRefreshToken,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  JWT_CONFIG,
} from './jwt';

// OTP System
export {
  generateOTP,
  sendOTP,
  verifyOTP,
  sendOTPForUser,
  sendOTPForRegistration,
  verifyOTPForRegistration,
  updateOTPUserId,
  cleanupExpiredCodes,
  OTP_SETTINGS,
} from './otp';
