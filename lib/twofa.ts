import { authenticator } from 'otpauth'
import QRCode from 'qrcode'

export function generateSecret(email: string) {
  const secret = authenticator.generateSecret(32)
  const totp = new authenticator.TOTP({
    issuer: 'TableBoost',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  })
  return {
    base32: secret,
    otpauth_url: totp.toString(), // uvijek string
  }
}

export function verifyToken(token: string, secret: string): boolean {
  try {
    const totp = new authenticator.TOTP({
      issuer: 'TableBoost',
      label: 'verify',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    })
    const delta = totp.validate({ token, window: 1 })
    return delta !== null
  } catch { return false }
}

export async function toQRDataUrl(otpauthUrl: string) {
  return await QRCode.toDataURL(otpauthUrl)
}

export const pending2FA = new Map<string, { userId: string; expires: number }>()
