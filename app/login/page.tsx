import LoginForm from './LoginForm'
import { prisma } from '@/lib/prisma'

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
        <img src={bgImage} alt="TableBoost" className="absolute inset-0 w-full h-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent" />
        <div className="relative z-10 flex flex-col justify-between h-full p-10 w-full">
          <div className="flex items-center gap-3">
            {logo? (
              <img src={logo} alt="logo" className="w-9 h-9 rounded-xl object-cover bg-white" />
            ) : (
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center font-black text-black text-">TB</div>
            )}
            <span className="text-white/90 font-semibold tracking-[0.14em] text- uppercase">{branding?.name || 'TABLEBOOST'}</span>
          </div>
          <div className="max-w-">
            <h1 className="text- font-[650] text-white leading-[0.95] tracking-[-0.03em]">
              Povećaj<br/>promet<br/><span className="text-white/60 font-[400]">svakog stola.</span>
            </h1>
            <p className="mt-5 text- leading-[1.6] text-white/60 font-[400] max-w-">
              Pametni QR meni koji prodaje više. Bez aplikacije, bez čekanja.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-[#fafaf9]">
        <div className="w-full max-w-">
          {branding && (
            <div className="mb-6 lg:hidden flex items-center gap-3">
              {logo && <img src={logo} alt="logo" className="w-10 h-10 rounded-xl object-cover" />}
              <span className="font-bold text-zinc-900">{branding.name}</span>
            </div>
          )}
          <LoginForm />
          <p className="mt-6 text- text-zinc-400 text-center tracking-wide">© {new Date().getFullYear()} TableBoost • tableboost.app</p>
        </div>
      </div>
    </div>
  )
}
