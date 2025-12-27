import { NextResponse } from "next/server";
import connectDB from "@/utils/ConnectDB";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Simple in-memory rate limiter (Note: This resets on server restart/lambda cold start)
// For production, use Redis or a database-backed solution.
const rateLimit = new Map();

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record) {
    return true;
  }

  if (now - record.startTime > RATE_LIMIT_WINDOW) {
    rateLimit.delete(ip);
    return true;
  }

  return record.count < MAX_ATTEMPTS;
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record) {
    rateLimit.set(ip, { count: 1, startTime: now });
  } else {
    // If window expired, reset
    if (now - record.startTime > RATE_LIMIT_WINDOW) {
      rateLimit.set(ip, { count: 1, startTime: now });
    } else {
      record.count += 1;
    }
  }
}

export async function POST(req) {
  try {
    // 1. Rate Limiting Check
    // In Next.js App Router, getting IP can be tricky depending on deployment (Vercel, etc.)
    // We'll try to get it from headers.
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { message: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    // 2. Find Admin
    const admin = await Admin.findOne({ email });

    // 3. Validate Credentials
    if (!admin) {
      recordFailedAttempt(ip);
      // Generic error message for security
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    // 4. Create Session Token
    // Ensure you have a JWT_SECRET in your .env file
    const secret = process.env.JWT_SECRET || "default_secret_do_not_use_in_production";
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      secret,
      { expiresIn: "1d" }
    );

    // 5. Set Cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Clear rate limit on success
    rateLimit.delete(ip);

    return NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
