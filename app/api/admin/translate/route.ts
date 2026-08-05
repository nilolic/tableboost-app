import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: NextRequest){
  try{
    const user = await getCurrentUser()
    if(!user) return NextResponse.json({error:"Unauthorized"},{status:401})
    
    const { text, targetLang, texts } = await req.json()
    
    if(!text && !texts) return NextResponse.json({error:"No text"},{status:400})
    
    const apiKey = process.env.DEEPL_API_KEY
    if(!apiKey){
      console.error("DEEPL_API_KEY missing")
      return NextResponse.json({error:"DEEPL_API_KEY nije postavljen"},{status:500})
    }
    
    const isFree = apiKey.endsWith(":fx")
    const endpoint = isFree ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate"
    
    const toTranslate = texts || [text]
    const target = targetLang || "EN"
    
    // DeepL expects EN, DE, etc.
    const deeplTarget = target.toUpperCase() === "EN" ? "EN-GB" : target.toUpperCase()
    
    const params = new URLSearchParams()
    toTranslate.forEach((t:string)=> params.append("text", t))
    params.append("target_lang", deeplTarget)
    params.append("source_lang", "HR")
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    })
    
    if(!res.ok){
      const err = await res.text()
      console.error("DeepL error", err)
      return NextResponse.json({error:`DeepL greška: ${err}`},{status:500})
    }
    
    const data = await res.json()
    const translations = data.translations?.map((t:any)=>t.text) || []
    
    if(texts){
      return NextResponse.json({translations})
    } else {
      return NextResponse.json({translated: translations[0]||"", translation: translations[0]||""})
    }
  }catch(e:any){
    console.error("translate error", e)
    return NextResponse.json({error:e.message},{status:500})
  }
}
