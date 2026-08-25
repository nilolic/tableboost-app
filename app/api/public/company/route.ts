export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(){
  let c = await (prisma as any).platformCompany.findUnique({where:{id:"1"}});
  if(!c) c = await (prisma as any).platformCompany.create({data:{id:"1"}});
  const is_demo=!c.oib||!c.broj_obrta||!c.legal_visible;
  return NextResponse.json({
    naziv_obrta:c.naziv_obrta||"CoreCode",
    oib:c.oib||"",
    broj_obrta:c.broj_obrta||"",
    adresa:c.adresa||"",
    grad:c.grad||"",
    email:c.email||"info@tableboost.app",
    web:c.web||"https://tableboost.app",
    iban:c.iban||"",
    legal_visible:!!c.legal_visible,
    is_demo,
  });
}
