"use server";

import { z } from "zod";
import { Resend } from "resend";

const resend = new Resend ("re_CqvACmXb_KQwAwpNtmiGp9KrEY2LWiuZp");

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(5, "Message is required"),
});

export async function sendContact(formData: FormData) {
  try {
    // ✅ Parse and validate with Zod
    const parsed = contactSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    });

    if (!parsed.success) {
      console.error("❌ Validation errors:", parsed.error.flatten().fieldErrors);
      return { success: false, errors: parsed.error.flatten().fieldErrors };
    }

    // ✅ Call Resend API
    const res = await resend.emails.send({
      from: "Akanksha <onboarding@resend.dev>",
      to: "akankshavadnerkar00@gmail.com",
      subject: `[Contact] ${parsed.data.subject}`,
      html: `
        <p><strong>Name:</strong> ${parsed.data.name}</p>
        <p><strong>Email:</strong> ${parsed.data.email}</p>
        <p><strong>Message:</strong><br/>${parsed.data.message}</p>
      `,
      replyTo: parsed.data.email,
    });

    // ✅ Check for errors in Resend response
    if (res.error) {
      console.error("❌ Resend API returned error:", res.error);
      return { success: false, errors: { general: [res.error.message || "Unknown email error"] } };
    }

    return { success: true };

  } catch (err: unknown) {
    console.error("❌ Exception during sendContact:", err);
    return { success: false, errors: { general: ["Unexpected server error"] } };
  }
}
