"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, User } from "lucide-react";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials");
        const data = await res.json();
        if (data.success) {
          setTestimonials(data.data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading || testimonials.length === 0) {
    return null; // Don't show section if no data
  }

  return (
    <section className="py-20 bg-green-50 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="text-center mb-16">
          <h2 className="section-heading">
            What Our Clients Say
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Hear from homeowners and businesses who have switched to solar with Solar Owl.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -left-4 md:-left-12 transform -translate-y-1/2 z-10">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white shadow-lg text-gray-600 hover:text-green-600 hover:scale-110 transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          
          <div className="absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2 z-10">
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white shadow-lg text-gray-600 hover:text-green-600 hover:scale-110 transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Testimonial Card */}
          <div className="overflow-hidden px-4">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative"
            >
              <Quote className="absolute top-8 left-8 w-12 h-12 text-green-100 fill-current" />
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="mb-6">
                  {testimonials[currentIndex].photo ? (
                    <img
                      src={testimonials[currentIndex].photo}
                      alt={testimonials[currentIndex].name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-green-50 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 border-4 border-white shadow-md">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonials[currentIndex].rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <blockquote className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed mb-8">
                  "{testimonials[currentIndex].message}"
                </blockquote>

                <div>
                  <div className="font-bold text-lg text-gray-900">
                    {testimonials[currentIndex].name}
                  </div>
                  {testimonials[currentIndex].designation && (
                    <div className="text-green-600 font-medium">
                      {testimonials[currentIndex].designation}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentIndex ? "bg-green-600 w-6" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
