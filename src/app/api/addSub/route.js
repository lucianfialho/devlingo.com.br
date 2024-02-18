import Welcome from "@/app/emails/welcome";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request, response) {
  const { email } = await request.json();

  if (!email)
    return NextResponse.json({ ok: false, message: "Email is required" });

  const resend = new Resend(process.env.RESEND_API_KEY);

  // const { data } = await resend.contacts.create({
  //   email,
  //   unsubscribed: false,
  //   audienceId: "1fd01781-a7c8-4db7-a9c7-a7ef536d1946",
  // });
  // console.log(emailContent);
  await resend.emails.send({
    from: "No reply <noreply@devlingo.com.br>",
    to: email,
    subject: "Seja bem-vindo ao </lingo>",
    react: Welcome(`123`),
  });

  return NextResponse.json(
    {
      ok: true,
      message: `Seu cadastro foi realizado com sucesso`,
    },
    { status: 200 }
  );
}
