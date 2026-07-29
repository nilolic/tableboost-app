import LoginForm from './LoginForm'
export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[#050505]">
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <img src="/login-bg.webp" alt="TableBoost" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="relative z-10 flex flex-col justify-between h-full p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center font-black text-black">TB</div>
            <span className="text-white font-bold tracking-widest text-sm">TABLEBOOST</span>
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white leading-[0.9]">Povecaj<br/>promet<br/><span className="text-zinc-400">svakog stola.</span></h1>
          </div>
        </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#0a0a0a]">
        <div className="w-full max-w-">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
