import { NextRequest, NextResponse } from "next/server";

// Simple PDF text extraction for HR cjenik - koristi pdf-parse
// Za skenirani PDF treba OCR, ovo je za text-based PDF
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "Nema file-a" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Pokušaj pdf-parse
    let text = "";
    try {
      // dynamic import jer pdf-parse nema tipove
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      text = data.text;
    } catch (err) {
      console.log("pdf-parse fail, vraćam raw info", err);
      // fallback - vrati da je upload uspio, parsiranje ide preko AI kasnije
      text = `PDF primljen: ${file.name}, veličina: ${buffer.length} bytes`;
    }

    // HR parser - prepoznaje kategorije i cijene
    const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
    
    const categories: any[] = [];
    let currentCat = { name: "Nekategorizirano", items: [] as any[] };
    categories.push(currentCat);

    // Regex za HR cijene: 12,50 € , 12.50€, 9,00
    const priceRegex = /(\d+[.,]\d{2})\s*€?/;
    const sizeRegex = /(0[.,]\d+\s*l|šalica|porcija|kom|100gr)/i;

    for (const line of lines) {
      // Detekcija kategorije (velika slova, bez cijene)
      if (line.length < 30 && !priceRegex.test(line) && /^[A-ZŠĐČĆŽ a-zšđčćž]+$/.test(line) && !line.includes('€')) {
        // moguća kategorija poput "Pizze", "Pića"
        if (['pizza','pića','pice','salate','dodaci','tjestenine','mesna','desert','predjela'].some(k=>line.toLowerCase().includes(k))) {
          currentCat = { name: line, items: [] };
          categories.push(currentCat);
          continue;
        }
      }

      const priceMatch = line.match(priceRegex);
      if (priceMatch) {
        // probaj izvući naziv i cijenu
        const price = parseFloat(priceMatch[1].replace(',', '.'));
        let name = line.replace(priceMatch[0], '').replace(/€/g,'').trim();
        // očisti veličinu
        const sizeMatch = name.match(sizeRegex);
        let size = "";
        if (sizeMatch) {
          size = sizeMatch[0];
          name = name.replace(sizeMatch[0], '').trim();
        }
        if (name.length > 2) {
          currentCat.items.push({ name, price, size, raw: line });
        }
      }
    }

    // Ako je malo prepoznato, vrati raw tekst da AI može dalje
    return NextResponse.json({
      success: true,
      fileName: file.name,
      textPreview: text.slice(0, 5000),
      categories: categories.filter(c=>c.items.length>0),
      totalItems: categories.reduce((s,c)=>s+c.items.length,0),
      rawLines: lines.length,
      note: "HR parser v1 - za skenirani PDF treba OCR (Tesseract hrvatski)"
    });

  } catch (e:any) {
    console.error("PDF import error", e);
    return NextResponse.json({ error: e.message || "Greška kod uvoza PDF-a" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    endpoint: "/api/menu/import-pdf",
    method: "POST file: PDF",
    example: "curl -F file=@cjenik.pdf https://tableboost.app/api/menu/import-pdf"
  });
}

