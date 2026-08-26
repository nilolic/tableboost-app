import type { Metadata } from 'next'
import LoginForm from './LoginForm'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function LoginPage({ searchParams }: { searchParams: { r?: string, restaurant?: string } }) {
  const slug = searchParams.r || searchParams.restaurant
  let branding: { name?: string, logoUrl?: string | null, loginImageUrl?: string | null } | null = null

  if (slug) {
    const rest = await prisma.restaurant.findUnique({ where: { slug }, select: { name: true, logoUrl: true, loginImageUrl: true } })
    if (rest) branding = rest
  }

  const bgImage = branding?.loginImageUrl || '/login-bg.webp'
  const logo = branding?.logoUrl

  return (
    <div className="min-h-screen flex bg-[#fafaf9]">
      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden bg-zinc-900">
        <img src={bgImage} alt="TableBoost" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
        <div className="relative z-10 flex flex-col justify-between h-full p-10 w-full">
          <div className="flex items-center gap-3">
            {logo? (
              <img src={logo} alt="logo" className="w-9 h-9 rounded-xl object-cover bg-white" />
            ) : (
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center font-black text-black">TB</div>
            )}
            <span className="text-white/90 font-semibold tracking-[0.14em] text-sm uppercase">{branding?.name || 'TABLEBOOST'}</span>
          </div>
          <div className="max-w-md">
            <h1 className="text-5xl font-[700] text-white leading-[0.95] tracking-[-0.03em]">
              Povećaj<br/>promet<br/><span className="text-white/70 font-[400]">svakog stola.</span>
            </h1>
            <p className="mt-5 text- leading-[1.6] text-white/60 font-[400] max-w-sm">
              Pametni QR meni koji prodaje više. Bez aplikacije, bez čekanja.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-[#fafaf9]">
        <div className="w-full max-w-sm">
          {branding && (
            <div className="mb-6 lg:hidden flex items-center gap-3">
              {logo && <img src={logo} alt="logo" className="w-10 h-10 rounded-xl object-cover" />}
              <span className="font-bold text-zinc-900">{branding.name}</span>
            </div>
          )}
          <LoginForm />
          <p className="mt-6 text-xs text-zinc-400 text-center tracking-wide">© {2026} TableBoost • tableboost.app</p>
        </div>
      </div>
    </div>
  )
}
