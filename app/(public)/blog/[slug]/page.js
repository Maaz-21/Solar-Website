"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function SingleBlogPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blog/${slug}`);
        const data = await res.json();
        if (data.success) {
          setPost(data.data);
        } else {
          setError("Blog not found");
        }
      } catch (error) {
        setError("Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [slug]);

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
      <Footer />
    </>
  );

  if (error || !post) return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h1 className="text-2xl font-bold text-dark mb-4">Blog Post Not Found</h1>
        <Link href="/blog" className="text-primary hover:underline">Back to Blog</Link>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen pt-32 pb-20">
        <article className="max-w-4xl mx-auto px-6">
          
          {/* Back Link */}
          <Link href="/blog" className="inline-flex items-center text-gray-500 hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to all articles
          </Link>

          {/* Header */}
          <header className="mb-10">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-dark font-medium">
                <Tag className="w-3 h-3" /> {post.category || "General"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> {post.author || "Admin"}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-dark mb-8 leading-tight">
              {post.title}
            </h1>

            {post.image && (
              <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-10">
                <Image 
                  src={post.image} 
                  alt={post.title} 
                  fill 
                  className="object-cover"
                />
              </div>
            )}
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-gray-700">
             {/* Simple rendering for now, assuming plain text or basic HTML */}
             <div className="whitespace-pre-wrap">{post.content}</div>
          </div>

        </article>
      </main>
      <Footer />
    </>
  );
}
