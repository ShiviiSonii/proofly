import { Resend } from "resend";

interface SendTestimonialRequestParams {
  to: string;
  projectName: string;
  categoryName: string;
  link: string;
  message?: string;
}

/**
 * Sends a testimonial request email using Resend.
 *
 * @param params - Email parameters
 * @returns Promise that resolves when email is sent
 * @throws Error if email sending fails
 */
export async function sendTestimonialRequestEmail({
  to,
  projectName,
  categoryName,
  link,
  message,
}: SendTestimonialRequestParams): Promise<void> {
  // Get Resend API key from environment variables
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.REQUEST_FROM_EMAIL || "onboarding@resend.dev";

  // Check if API key is configured
  if (!apiKey) {
    throw new Error(
      "Resend API key not configured. Please set RESEND_API_KEY in .env file.",
    );
  }

  // Initialize Resend client
  const resend = new Resend(apiKey);

  // Email content
  const subject = `Share your testimonial for ${projectName}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a73e8;">Share Your Testimonial</h2>
        <p>Hi there,</p>
        <p>We'd love to hear about your experience with <strong>${projectName}</strong>!</p>
        ${message ? `<p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">${message}</p>` : ""}
        <p>Please take a moment to share your feedback:</p>
        <div style="margin: 30px 0;">
          <a href="${link}" 
             style="display: inline-block; background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Submit Testimonial
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">
          Category: ${categoryName}
        </p>
        <p style="font-size: 12px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${link}" style="color: #1a73e8; word-break: break-all;">${link}</a>
        </p>
      </body>
    </html>
  `;

  const textContent = `
Share Your Testimonial

Hi there,

We'd love to hear about your experience with ${projectName}!

${message ? `\n${message}\n` : ""}

Please take a moment to share your feedback by visiting:
${link}

Category: ${categoryName}
  `.trim();

  // Send email
  try {
    const { data, error } = await resend.emails.send({
      from: `${projectName} <${fromEmail}>`,
      to: [to],
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log("✅ Email sent successfully:", data?.id);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
