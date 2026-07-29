"use client"
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="bg-black text-white px-6 py-3 rounded-xl font-bold print:hidden">
      Print / Save PDF
    </button>
  )
}
