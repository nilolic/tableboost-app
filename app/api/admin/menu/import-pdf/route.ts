import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getImpersonateId } from "@/lib/auth";
import { getRestaurantId } from "@/lib/getRestaurantId";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const impId = await getImpersonateId();
    const restaurantId = getRestaurantId(user, impId);
    if (!restaurantId) return NextResponse.json({ error: "No restaurant" }, { status: 400 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const shouldSave = formData.get('save') === 'true';
    if (!file) return NextResponse.json({ error: "Nema file-a" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      text = data.text;
    } catch (e) {
      return NextResponse.json({ error: "PDF parse failed" }, { status: 500 });
    }

    const lines = text.split('\n').map((l:string)=>l.trim()).filter(Boolean);
    const categories: any[] = [];
    let currentCat = { name: "Nekategorizirano", items: [] as any[] };
    categories.push(currentCat);
    const priceRegex = /(\d+[.,]\d{2})\s*€?/;

    for (const line of lines) {
      const priceMatch = line.match(priceRegex);
      if (!priceMatch && line.length < 40 && /^[A-ZŠĐČĆŽ a-zšđčćž\s\-]+$/.test(line)) {
        const lower = line.toLowerCase();
        if (['pizza','pića','pice','salate','dodaci','tjestenine','mesna','desert','predjela','roštilj','piće','burger','steak','doručak','juhe','rižoto','tjestenina','prilog','bezalkoholna','alkoholna','vino','pivo','kava','čaj'].some(k=>lower.includes(k))) {
          currentCat = { name: line, items: [] };
          categories.push(currentCat);
          continue;
        }
      }
      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(',', '.'));
        let name = line.replace(priceMatch[0], '').replace(/€/g,'').trim().replace(/^[0-9.\-–\s]+/, '').trim();
        if (name.length > 2 && name.length < 80) currentCat.items.push({ name, price, raw: line });
      }
    }

    const filtered = categories.filter((c:any)=>c.items.length>0);

    if (!shouldSave) {
      return NextResponse.json({ preview: true, restaurantId, categories: filtered, totalItems: filtered.reduce((s:any,c:any)=>s+c.items.length,0) });
    }

    let createdCats = 0;
    let createdItems = 0;
    const maxCat = await prisma.menuCategory.findFirst({ where: { restaurantId }, orderBy: { order: 'desc' } });
    let catOrder = (maxCat?.order || 0) + 1;

    for (const cat of filtered) {
      let dbCat = await prisma.menuCategory.findFirst({ where: { name: cat.name, restaurantId } });
      if (!dbCat) {
        dbCat = await prisma.menuCategory.create({ data: { name: cat.name, restaurantId, order: catOrder++ } });
        createdCats++;
      }
      const maxItem = await prisma.menuItem.findFirst({ where: { categoryId: dbCat.id }, orderBy: { order: 'desc' } }).catch(()=>null);
      let itemOrder = (maxItem as any)?.order? (maxItem as any).order + 1 : 0;
      for (const it of cat.items) {
        const exists = await prisma.menuItem.findFirst({ where: { name: it.name, categoryId: dbCat.id, restaurantId } });
        if (!exists) {
          await prisma.menuItem.create({ data: { name: it.name, price: it.price, description: it.raw, categoryId: dbCat.id, restaurantId, order: itemOrder++ } as any });
          createdItems++;
        }
      }
    }

    return NextResponse.json({ success: true, restaurantId, createdCats, createdItems, categories: filtered });
  } catch (e:any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
