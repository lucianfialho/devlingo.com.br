import { NextResponse } from "next/server";
import { Resend } from "resend";

const baseUrl = process.env.BASE_URL || "https://devlingo.com.br";

export async function GET(request, response) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ ok: false, message: "Email is required" });

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data } = await resend.contacts.remove({
    id,
    audienceId: "1fd01781-a7c8-4db7-a9c7-a7ef536d1946",
  });

  return NextResponse.redirect(`${baseUrl}/unsub`);
}
