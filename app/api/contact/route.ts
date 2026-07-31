import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message, source } = body;
    
    if (!email || !message) {
      return NextResponse.json({ error: "Email i poruka su obavezni" }, { status: 400 });
    }

    // Log for now - kasnije spoji Resend / SMTP na admin@tableboost.app
    console.log("CONTACT FORM:", { name, email, phone, message, source, date: new Date().toISOString() });
    
    // TODO: Dodaj slanje maila preko Resend
    // await resend.emails.send({
    //   from: 'TableBoost <noreply@tableboost.app>',
    //   to: 'admin@tableboost.app',
    //   subject: `Novi upit sa sajta - ${source || 'landing'}`,
    //   html: `<p><b>Ime:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Tel:</b> ${phone}</p><p>${message}</p>`
    // });

    return NextResponse.json({ success: true, to: "admin@tableboost.app" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Greška" }, { status: 500 });
  }
}

