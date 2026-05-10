import { NextResponse } from "next/server";
import { calculateEnergy } from "@/lib/solar-engine/energyCalculation";

// POST /api/solar-design/calculate-energy
export async function POST(request) {
  try {
    const body = await request.json();
    const { systemSizeKW, city, state, lat, lng, electricityRate } = body;

    if (!systemSizeKW || systemSizeKW <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid system size is required" },
        { status: 400 }
      );
    }

    const energyReport = calculateEnergy({
      systemSizeKW,
      city: city || "",
      state: state || "",
      lat,
      lng,
      electricityRate,
    });

    return NextResponse.json({ success: true, energyReport });
  } catch (error) {
    console.error("Error calculating energy:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
