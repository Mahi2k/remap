import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  projectType: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, projectType, message }: ContactEmailRequest = await req.json();

    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "Remap Design <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for your inquiry!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0d9488; text-align: center;">Thank You for Contacting Remap!</h1>
          
          <p>Dear ${firstName} ${lastName},</p>
          
          <p>Thank you for reaching out to us regarding your <strong>${projectType}</strong> project. We have received your message and our team will review your requirements.</p>
          
          <div style="background-color: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0d9488; margin-top: 0;">Your Message:</h3>
            <p style="margin-bottom: 0;">"${message}"</p>
          </div>
          
          <p>We typically respond within 24 hours with a detailed quote and next steps. In the meantime, feel free to browse our portfolio or contact us directly if you have any urgent questions.</p>
          
          <p>For immediate assistance, you can also reach us on WhatsApp at <strong>+91 8087247972</strong>.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>
          <strong>The Remap Design Team</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            This is an automated confirmation email. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    // Send notification email to the business
    const businessEmailResponse = await resend.emails.send({
      from: "Remap Contact Form <onboarding@resend.dev>",
      to: ["designremap@gmail.com"],
      subject: `New Contact Form Submission - ${projectType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0d9488;">New Contact Form Submission</h1>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0;">Contact Information:</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Project Type:</strong> ${projectType}</p>
          </div>
          
          <div style="background-color: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0d9488; margin-top: 0;">Message:</h3>
            <p style="margin-bottom: 0;">"${message}"</p>
          </div>
          
          <p><em>Please respond to the customer within 24 hours.</em></p>
        </div>
      `,
    });

    console.log("Emails sent successfully:", {
      user: userEmailResponse,
      business: businessEmailResponse
    });

    return new Response(JSON.stringify({ 
      success: true,
      userEmail: userEmailResponse,
      businessEmail: businessEmailResponse
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);