import ConnectDB from "@/utils/ConnectDB";
import Enquiry from "@/models/Enquiry";
import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/Sendmail";

export async function POST(request) {
  try {
    await ConnectDB();
    const body = await request.json();
    const { name, phone, email, message, city, pincode, billRange, solarDesign } = body;

    if (!name || !phone || !email) {
      return NextResponse.json({ success: false, error: "Name, phone, and email are required" }, { status: 400 });
    }

    const enquiry = await Enquiry.create({
      name,
      phone,
      email,
      message,
      city,
      pincode,
      billRange,
      ...(solarDesign ? { solarDesign } : {}),
    });

    // Send emails without blocking (fire and forget)
    (async () => {
      try {
        // 1. Send to Admin
        const designHtml = solarDesign
          ? `
          <h3>Solar Design Studio details</h3>
          <p><strong>Address:</strong> ${solarDesign.address || 'N/A'}</p>
          <p><strong>Roof area:</strong> ${solarDesign.roofAreaM2 || 0} m² (usable ${solarDesign.usableAreaM2 || 0} m²)</p>
          <p><strong>System designed:</strong> ${solarDesign.systemSizeKW || 0} kW · ${solarDesign.panelCount || 0} panels · ~${solarDesign.estimatedAnnualKWh || 0} kWh/yr</p>
          <p><strong>Monthly bill / units:</strong> ₹${solarDesign.monthlyBill || 0} / ${solarDesign.monthlyUnits || 0} kWh @ ₹${solarDesign.tariff || 0}/kWh (${solarDesign.coverage || 0}% coverage goal)</p>
        `
          : "";

        const adminHtml = `
          <h2>New Enquiry Received${solarDesign ? " — Solar Design Studio" : ""}</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>City:</strong> ${city || 'N/A'}</p>
          <p><strong>Pincode:</strong> ${pincode || 'N/A'}</p>
          <p><strong>Bill Range:</strong> ${billRange || 'N/A'}</p>
          <p><strong>Message:</strong> ${message || 'N/A'}</p>
          ${designHtml}
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        `;
        
        if (process.env.ADMIN_EMAIL) {
          await sendEmail(process.env.ADMIN_EMAIL, "New Enquiry Received", adminHtml);
        } else {
          console.warn("ADMIN_EMAIL is not defined in environment variables.");
        }

        // 2. Auto-reply to User
        if (email) {
          const userHtml = `
            <h2>Thank you for contacting SolarOwl!</h2>
            <p>Hi ${name},</p>
            <p>We have received your enquiry. Our team will review your details and get back to you shortly.</p>
            <p>Best Regards,<br>SolarOwl Team</p>
          `;
          await sendEmail(email, "We received your enquiry", userHtml);
        }
      } catch (emailError) {
        console.error("Failed to send emails:", emailError);
      }
    })();

    return NextResponse.json({ success: true, data: enquiry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
