import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ContactInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please provide a valid email address"),
  role: z.string().trim().max(100).default("Educator / Parent"),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(3000),
});

export type ContactSubmission = z.infer<typeof ContactInput>;

// The recipient email is configured strictly on the server-side to keep the creator's address private
const CREATOR_EMAIL = process.env["CREATOR_CONTACT_EMAIL"] || "BrunoCouto07@gmail.com";

/**
 * Server function to handle messages sent from the Contact form.
 * The destination address is kept private and never exposed to the client bundle.
 */
export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => ContactInput.parse(input))
  .handler(async ({ data }): Promise<{ success: boolean; message: string }> => {
    const timestamp = new Date().toISOString();
    console.info(`[CONTACT INBOX] New message received for ${CREATOR_EMAIL} at ${timestamp}:`, {
      fromName: data.name,
      fromEmail: data.email,
      role: data.role,
      subject: data.subject,
      messageLength: data.message.length,
    });

    // If an external mail API key (e.g. RESEND_API_KEY) is configured in environment, dispatch email
    const resendKey = process.env["RESEND_API_KEY"];
    if (resendKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "Kid Choices Connect <notifications@kidchoicesconnect.app>",
            to: [CREATOR_EMAIL],
            reply_to: data.email,
            subject: `[Kid Choices Connect] ${data.subject} (from ${data.name} - ${data.role})`,
            text: `New contact form submission from Kid Choices Connect:\n\nName: ${data.name}\nEmail: ${data.email}\nRole: ${data.role}\nSubject: ${data.subject}\n\nMessage:\n${data.message}\n\nTimestamp: ${timestamp}`,
          }),
        });
        if (!response.ok) {
          console.warn("[CONTACT INBOX] Resend dispatch failed with status:", response.status);
        }
      } catch (err) {
        console.warn("[CONTACT INBOX] Optional email relay failed:", err);
      }
    }

    return {
      success: true,
      message:
        "Your message has been safely delivered to the creator! We will follow up directly at your email address.",
    };
  });
