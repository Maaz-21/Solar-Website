import { verifyAdmin } from "@/utils/verifyAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await verifyAdmin();
    return NextResponse.json({ success: true, user: { email: user.email, role: "admin" } });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
}
