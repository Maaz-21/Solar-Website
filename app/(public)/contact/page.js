"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="bg-light min-h-screen">
        <ContactHero />
        <ContactContent />
      </main>
      <Footer />
    </>
  );
}

function ContactHero() {
  return (
    <section className="pt-32 pb-12 bg-dark text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Have questions about solar? Ready to start your journey? We're here to help you every step of the way.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ContactContent() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    interest: "Residential Solar (1-10kW)",
    message: ""
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    
    const payload = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      message: `Interested in: ${formData.interest}. Message: ${formData.message}`
    };

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setFormData({ firstName: "", lastName: "", email: "", phone: "", interest: "Residential Solar (1-10kW)", message: "" });
        alert("Message sent successfully!");
      } else {
        setStatus("error");
        alert("Failed to send message.");
      }
    } catch (error) {
      setStatus("error");
      alert("Something went wrong.");
    } finally {
      setStatus("");
    }
  };

  return (
    <section className="section">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-dark mb-8">Contact Information</h2>
            
            <div className="space-y-8 mb-12">
              <ContactInfoItem 
                icon={Phone} 
                title="Phone & WhatsApp" 
                content="+91 98765 43210" 
                subContent="Mon-Sat, 9am - 7pm"
                href="tel:+919876543210"
              />
              <ContactInfoItem 
                icon={Mail} 
                title="Email Us" 
                content="hello@tirangasolar.com" 
                subContent="We reply within 24 hours"
                href="mailto:hello@tirangasolar.com"
              />
              <ContactInfoItem 
                icon={MapPin} 
                title="Visit Our Office" 
                content="123, Solar Tech Park, MIDC Industrial Area," 
                subContent="Nagpur, Maharashtra - 440016"
              />
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-2xl h-64 w-full overflow-hidden relative group">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium bg-gray-100">
                <MapPin className="w-6 h-6 mr-2" /> Google Map Placeholder
              </div>
              {/* In a real app, embed Google Maps iframe here */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.664676467646!2d79.0882!3d21.1458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA4JzQ0LjkiTiA3OcKwMDUnMTcuNSJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
                className="opacity-50 group-hover:opacity-100 transition-opacity duration-300"
              ></iframe>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-10 border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-dark mb-2">Send us a message</h2>
            <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you shortly.</p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup label="First Name" placeholder="John" name="firstName" value={formData.firstName} onChange={handleChange} />
                <InputGroup label="Last Name" placeholder="Doe" name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>
              
              <InputGroup label="Email Address" type="email" placeholder="john@example.com" name="email" value={formData.email} onChange={handleChange} />
              <InputGroup label="Phone Number" type="tel" placeholder="+91 98765 43210" name="phone" value={formData.phone} onChange={handleChange} />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interested In</label>
                <select 
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                >
                  <option>Residential Solar (1-10kW)</option>
                  <option>Commercial Solar (10kW+)</option>
                  <option>Solar Water Heater</option>
                  <option>Maintenance / Service</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea 
                  rows="4" 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  placeholder="Tell us about your requirements..."
                ></textarea>
              </div>

              <button disabled={status === "loading"} className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2 group disabled:opacity-70">
                {status === "loading" ? "Sending..." : "Send Message"} <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Your data is secure. We never spam.
              </p>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function ContactInfoItem({ icon: Icon, title, content, subContent, href }) {
  const Wrapper = href ? 'a' : 'div';
  
  return (
    <Wrapper href={href} className="flex items-start gap-4 group">
      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-bold text-dark text-lg">{title}</h3>
        <p className="text-gray-800 font-medium">{content}</p>
        {subContent && <p className="text-sm text-gray-500 mt-1">{subContent}</p>}
      </div>
    </Wrapper>
  );
}

function InputGroup({ label, type = "text", placeholder, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input 
        type={type} 
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}
