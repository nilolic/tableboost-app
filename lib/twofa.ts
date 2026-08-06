import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export const pending2FA: Map<string, {userId: string, expires: number}> = (globalThis as any).pending2FA || new Map()
export const pendingSetup: Map<string, {userId: string, secret: string, expires: number}> = (globalThis as any).pendingSetup || new Map()
;(globalThis as any).pending2FA = pending2FA
;(globalThis as any).pendingSetup = pendingSetup

if(!(globalThis as any)._2faCleaner){
  (globalThis as any)._2faCleaner = setInterval(()=>{
    const now = Date.now()
    for(let [k,v] of pending2FA) if(now > v.expires) pending2FA.delete(k)
    for(let [k,v] of pendingSetup) if(now > v.expires) pendingSetup.delete(k)
  }, 60*1000)
}

export function generateSecret(username: string){
  return speakeasy.generateSecret({name: `TABLEBOOST:${username}`, issuer: 'TABLEBOOST', length: 20})
}
export async function toQRDataUrl(otpauth_url: string){
  return QRCode.toDataURL(otpauth_url)
}
export function verifyToken(secret: string, token: string){
  return speakeasy.totp.verify({secret, encoding:'base32', token, window:2})
}
