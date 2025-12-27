import ConnectDB from "@/utils/ConnectDB";
import Blog from "@/models/Blog";
import { verifyAdmin } from "@/utils/verifyAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await verifyAdmin();
    await ConnectDB();
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function POST(request) {
  try {
    await verifyAdmin();
    await ConnectDB();
    const body = await request.json();
    const { title, slug, content, image, category, author, published } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ success: false, error: "Title, slug, and content are required" }, { status: 400 });
    }

    const blog = await Blog.create({
      title,
      slug,
      content,
      image,
      category,
      author,
      published: published || false
    });

    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}