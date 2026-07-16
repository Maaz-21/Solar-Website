import ConnectDB from "@/utils/ConnectDB";
import Enquiry from "@/models/Enquiry";
import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/Sendmail";

// Escape user input before interpolating into email HTML — prevents
// HTML/script injection into the admin notification.
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const clip = (value, max) => String(value ?? "").slice(0, max);

// Basic in-memory rate limit: 5 enquiries / 10 min per IP (resets on cold
// start — good enough to stop casual spam without extra infrastructure).
const rateLimit = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function allowRequest(ip) {
  const now = Date.now();
  const record = rateLimit.get(ip);
  if (!record || now - record.start > WINDOW_MS) {
    rateLimit.set(ip, { count: 1, start: now });
    return true;
  }
  record.count += 1;
  return record.count <= MAX_PER_WINDOW;
}

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (!allowRequest(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many enquiries. Please try again later." },
        { status: 429 }
      );
    }

    await ConnectDB();
    const body = await request.json();
    const solarDesign = body.solarDesign;
    const name = clip(body.name, 100).trim();
    const phone = clip(body.phone, 20).trim();
    const email = clip(body.email, 150).trim();
    const message = clip(body.message, 2000);
    const city = clip(body.city, 100);
    const pincode = clip(body.pincode, 12);
    const billRange = clip(body.billRange, 30);

    if (!name || !phone || !email) {
      return NextResponse.json({ success: false, error: "Name, phone, and email are required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email address" }, { status: 400 });
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
          <p><strong>Address:</strong> ${esc(solarDesign.address) || 'N/A'}</p>
          <p><strong>Roof area:</strong> ${Number(solarDesign.roofAreaM2) || 0} m² (usable ${Number(solarDesign.usableAreaM2) || 0} m²)</p>
          <p><strong>System designed:</strong> ${Number(solarDesign.systemSizeKW) || 0} kW · ${Number(solarDesign.panelCount) || 0} panels · ~${Number(solarDesign.estimatedAnnualKWh) || 0} kWh/yr</p>
          <p><strong>Monthly bill / units:</strong> ₹${Number(solarDesign.monthlyBill) || 0} / ${Number(solarDesign.monthlyUnits) || 0} kWh @ ₹${Number(solarDesign.tariff) || 0}/kWh (${Number(solarDesign.coverage) || 0}% coverage goal)</p>
        `
          : "";

        const adminHtml = `
          <h2>New Enquiry Received${solarDesign ? " — Solar Design Studio" : ""}</h2>
          <p><strong>Name:</strong> ${esc(name)}</p>
          <p><strong>Phone:</strong> ${esc(phone)}</p>
          <p><strong>Email:</strong> ${esc(email)}</p>
          <p><strong>City:</strong> ${esc(city) || 'N/A'}</p>
          <p><strong>Pincode:</strong> ${esc(pincode) || 'N/A'}</p>
          <p><strong>Bill Range:</strong> ${esc(billRange) || 'N/A'}</p>
          <p><strong>Message:</strong> ${esc(message) || 'N/A'}</p>
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
            <p>Hi ${esc(name)},</p>
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
