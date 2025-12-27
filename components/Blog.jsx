"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";

import { useState, useEffect } from "react";

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blog');
        const data = await res.json();
        if (data.success) {
          const formattedPosts = data.data.slice(0, 3).map(post => ({
            title: post.title,
            date: new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            image: post.image || "https://images.unsplash.com/photo-1508514177221-188b1cf2f26f?q=80&w=2070&auto=format&fit=crop",
            slug: `/blog/${post.slug}`,
            category: post.category
          }));
          setPosts(formattedPosts);
        }
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <section className="section bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-3">
              Latest from our blog
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Insights, guides, and updates to help you make informed solar decisions.
            </p>
          </div>
          
          <a
            href="/blog"
            className="hidden md:inline-flex items-center text-primary font-semibold hover:text-green-700 transition-colors group"
          >
            View all articles <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>

        {/* Articles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary uppercase tracking-wide">
                  {post.category}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </div>
                
                <h3 className="font-bold text-xl text-dark mb-3 leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                <div className="mt-auto pt-4">
                  <a href={post.slug} className="text-sm text-primary font-semibold inline-flex items-center group/link">
                    Read article <ArrowRight className="ml-1 w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 md:hidden text-center">
          <a
            href="/blog"
            className="inline-flex items-center text-primary font-medium"
          >
            View all articles →
          </a>
        </div>

      </div>
    </section>
  );
}
