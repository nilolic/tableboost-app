const DEEPL_API_KEY = process.env.DEEPL_API_KEY
export async function translateText(text: string, targetLang: 'EN' | 'DE' | 'HR', sourceLang: 'HR' | 'EN' | 'DE' = 'HR'): Promise<string> {
  if (!text?.trim()) return text
  if (!DEEPL_API_KEY) throw new Error('DEEPL_API_KEY nije postavljen')
  const isFree = DEEPL_API_KEY.endsWith(':fx')
  const url = isFree? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate'
  const targetMap: any = { EN: 'EN-GB', DE: 'DE', HR: 'HR' }
  const sourceMap: any = { HR: 'HR', EN: 'EN', DE: 'DE' }
  const params = new URLSearchParams({
    auth_key: DEEPL_API_KEY,
    text: text,
    target_lang: targetMap[targetLang] || targetLang,
   ...(sourceLang? { source_lang: sourceMap[sourceLang] } : {})
  })
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() })
  if (!res.ok) { const err = await res.text(); console.error('DeepL error', err); throw new Error(`DeepL ${res.status}: ${err}`) }
  const data = await res.json()
  return data.translations?.[0]?.text || text
}
