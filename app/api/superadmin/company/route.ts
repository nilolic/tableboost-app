import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(){
  let c = await (prisma as any).platformCompany.findUnique({where:{id:"1"}});
  if(!c) c = await (prisma as any).platformCompany.create({data:{id:"1"}});
  return NextResponse.json(c);
}
export async function POST(req:Request){
  const d=await req.json();
  const c=await (prisma as any).platformCompany.upsert({
    where:{id:"1"},
    update:{naziv_obrta:d.naziv_obrta,oib:d.oib,broj_obrta:d.broj_obrta,adresa:d.adresa,grad:d.grad,email:d.email,web:d.web,iban:d.iban,legal_visible:!!d.legal_visible},
    create:{id:"1",naziv_obrta:d.naziv_obrta,oib:d.oib,broj_obrta:d.broj_obrta,adresa:d.adresa,grad:d.grad,email:d.email,web:d.web,iban:d.iban,legal_visible:!!d.legal_visible},
  });
  return NextResponse.json(c);
}
