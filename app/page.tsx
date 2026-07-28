export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="text-2xl font-black">TableBoost</div>
        <a href="/dashboard" className="bg-black text-white px-5 py-2.5 rounded-full font-medium">Dashboard</a>
      </nav>
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-block bg-green-100 text-green-800 text-sm px-4 py-1 rounded-full mb-6 font-medium">NOVO • Bez provizije • Tvoja baza</div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-6">
          Restoran koji<br/>radi dok ti spavaš.
        </h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-10">
          QR kod na stolu → gost naručuje sam → kuhinja dobiva ticket → ti naplaćuješ više. 30% brža usluga, 0% provizije Woltu.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/dashboard" className="bg-black text-white px-8 py-4 rounded-full text-lg font-semibold">Pokreni besplatno</a>
          <a href="#demo" className="border border-black px-8 py-4 rounded-full text-lg font-semibold">Vidi demo</a>
        </div>
        <div className="mt-20 grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-8 rounded- border">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-xl mb-2">QR Meni za 2 minute</h3>
            <p className="text-neutral-600">Dodaj jela, printaj QR, zalijepi na stol. Gost skenira i naručuje bez konobara.</p>
          </div>
          <div className="bg-white p-8 rounded- border">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="font-bold text-xl mb-2">Live Kuhinja</h3>
            <p className="text-neutral-600">Narudžbe stižu instant na tablet u kuhinji. Status: zaprimljeno → u pripremi → spremno.</p>
          </div>
          <div className="bg-white p-8 rounded- border">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="font-bold text-xl mb-2">Tvoja baza, tvoj novac</h3>
            <p className="text-neutral-600">Sve na tvom serveru (Hetzner), u tvojoj postgres bazi. Nema provizije po narudžbi.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
