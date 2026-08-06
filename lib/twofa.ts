import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export function generateSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `TableBoost:${email}`,
    issuer: 'TableBoost',
    length: 20,
  })
  return {
    base32: secret.base32 as string,
    otpauth_url: secret.otpauth_url as string,
  }
}

export function verifyToken(token: string, secret: string): boolean {
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    }) as boolean
  } catch { return false }
}

export async function toQRDataUrl(otpauthUrl: string) {
  return await QRCode.toDataURL(otpauthUrl)
}

// kompatibilnost za sve importe
export const pending2FA = new Map<string, { userId: string; expires: number }>()
export const pendingSetup = pending2FA
export const pendingLogin = pending2FA
