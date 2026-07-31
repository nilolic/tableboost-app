 // @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: "Nema file-a" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      text = data.text;
    } catch (err) {
      console.error("PDF parse error", err);
      text = "";
    }
    const lines = text.split('\n').map((l:string)=>l.trim()).filter(Boolean);
    const categories: any[] = [];
    let currentCat = { name: "Nekategorizirano", items: [] as any[] };
    categories.push(currentCat);
    const priceRegex = /(\d+[.,]\d{2})\s*€?/;
    const sizeRegex = /(0[.,]\d+\s*l|salica|porcija|kom|100gr)/i;
    for (const line of lines) {
      if (line.length < 30 &&!priceRegex.test(line) && /^[A-ZŠĐČĆŽ a-zšđčćž]+$/.test(line) &&!line.includes('€')) {
        if (['pizza','pića','pice','salate','dodaci','tjestenine','mesna','desert','predjela','roštilj','piće'].some(k=>line.toLowerCase().includes(k))) {
          currentCat = { name: line, items: [] };
          categories.push(currentCat);
          continue;
        }
      }
      const priceMatch = line.match(priceRegex);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(',', '.'));
        let name = line.replace(priceMatch[0], '').replace(/€/g,'').trim();
        const sizeMatch = name.match(sizeRegex);
        let size = "";
        if (sizeMatch) {
          size = sizeMatch[0];
          name = name.replace(sizeMatch[0], '').trim();
        }
        if (name.length > 2) currentCat.items.push({ name, price, size, raw: line });
      }
    }
    return NextResponse.json({
      success: true,
      fileName: file.name,
      textPreview: text.slice(0, 5000),
      categories: categories.filter((c:any)=>c.items.length>0),
      totalItems: categories.reduce((s:any,c:any)=>s+c.items.length,0),
      rawLines: lines.length,
    });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || "Greška" }, { status: 500 });
  }
}
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "/api/menu/import-pdf" });
}
