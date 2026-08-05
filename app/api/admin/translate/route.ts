import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(req: NextRequest){
  try{
    const user = await getCurrentUser()
    if(!user) return NextResponse.json({error:"Unauthorized"},{status:401})
    
    const body = await req.json().catch(()=>({}))
    const { text, targetLang, texts } = body as {text?:string, targetLang?:string, texts?:string[]}
    
    if(!text && (!texts || texts.length===0)) return NextResponse.json({error:"No text"},{status:400})
    
    const apiKey = process.env.DEEPL_API_KEY
    if(!apiKey){
      return NextResponse.json({error:"DEEPL_API_KEY nije postavljen u env"},{status:500})
    }
    
    const isFree = apiKey.endsWith(":fx")
    const endpoint = isFree ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate"
    
    const toTranslate = texts && texts.length>0 ? texts : [text!]
    const target = (targetLang || "EN").toUpperCase()
    const deeplTarget = target === "EN" ? "EN-GB" : target
    
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
      const errText = await res.text()
      console.error("DeepL error", res.status, errText)
      return NextResponse.json({error:`DeepL greška ${res.status}: ${errText}`},{status:500})
    }
    
    const data = await res.json()
    const translations: string[] = data.translations?.map((t:any)=>t.text) || []
    
    if(texts){
      return NextResponse.json({translations})
    } else {
      return NextResponse.json({translated: translations[0]||"", translation: translations[0]||""})
    }
  }catch(e:any){
    console.error("translate API error", e)
    return NextResponse.json({error:e.message||"Server error"},{status:500})
  }
}
