import cloudinary from "@/lib/cloudinary.config..js";
import { verifyAdmin } from "@/utils/verifyAdmin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    stream.end(buffer);
  });

export async function POST(request) {
  try {
    await verifyAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "tiranga-solar";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "Image file is required" },
        { status: 400 }
      );
    }

    if (!file.type || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image uploads are allowed" },
        { status: 400 }
      );
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { success: false, error: "Image must be 5MB or smaller" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadToCloudinary(buffer, { folder });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    const status = error.message?.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status }
    );
  }
}
