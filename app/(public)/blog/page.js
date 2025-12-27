"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, User, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blog');
        const data = await res.json();
        if (data.success) {
          const formattedPosts = data.data.map(post => ({
            ...post,
            date: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            excerpt: post.content ? post.content.substring(0, 120) + "..." : "Click to read more...",
            image: post.image || "https://images.unsplash.com/photo-1508514177221-188b1cf2f26f?q=80&w=2070&auto=format&fit=crop"
          }));
          setPosts(formattedPosts);
        }
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-light min-h-screen">
        {/* Header */}
        <section className="pt-32 pb-12 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
                Solar Insights & News
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Expert advice, industry updates, and guides to help you go green.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="section">
          <div className="max-w-7xl mx-auto px-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <BlogCard key={post.slug} post={post} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function BlogCard({ post, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col h-full"
    >
      <Link href={`/blog/${post.slug}`} className="block relative h-60 overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1">
          <Tag className="w-3 h-3" /> {post.category}
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> {post.date}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-3 h-3" /> {post.author}
          </span>
        </div>
        
        <Link href={`/blog/${post.slug}`} className="block">
          <h2 className="font-bold text-xl text-dark mb-3 leading-snug group-hover:text-primary transition-colors">
            {post.title}
          </h2>
        </Link>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-50">
          <Link 
            href={`/blog/${post.slug}`}
            className="text-sm text-primary font-semibold inline-flex items-center group/link"
          >
            Read article <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
