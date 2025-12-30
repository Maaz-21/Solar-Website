"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import BillRange from "@/components/Contact";

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
    name: "",
    phone: "",
    email: "",
    city: "",
    pincode: "",
    billRange: "",
    message: ""
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setFormData({ name: "", phone: "", email: "", city: "", pincode: "", billRange: "", message: "" });
      } else {
        setStatus("error");
        alert("Failed to send message: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      setStatus("error");
      alert("Something went wrong.");
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
            <h2 className="section-heading">Contact Information</h2>
            
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
                content="Samsherpur Village, Nandurbar Taluka," 
                subContent="Nandurbar, Maharashtra - 425412"
              />
            </div>

            {/* Map */}
            <div className="w-full rounded-2xl h-80 overflow-hidden shadow-xl border border-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3712.7992729113985!2d74.3308581747265!3d21.476391272254638!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdf0d837241ff99%3A0x2e374b8a7441e198!2sTiranga%20green%20energy%20solutions!5e0!3m2!1sen!2sin!4v1767020002178!5m2!1sen!2sin"
                width="100%"
                height="100%"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Tiranga Solar Location"
              />
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="contact-card p-8 md:p-10"
          >
            {status === "success" ? (
              <Success onReset={() => setStatus("")} />
            ) : (
              <>
                <h2 className="text-2xl font-bold text-dark mb-2">Send us a message</h2>
                <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you shortly.</p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <InputGroup label="Full Name" placeholder="John Doe" name="name" value={formData.name} onChange={handleChange} required />
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup label="Phone Number" type="tel" placeholder="+91 98765 43210" name="phone" value={formData.phone} onChange={handleChange} required />
                    <InputGroup label="Email Address" type="email" placeholder="john@example.com" name="email" value={formData.email} onChange={handleChange} required />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup label="City" placeholder="Nagpur" name="city" value={formData.city} onChange={handleChange} />
                    <InputGroup label="Pincode" placeholder="440001" name="pincode" value={formData.pincode} onChange={handleChange} />
                  </div>
                  
                  <div>
                    <label className="form-label ">Monthly Electricity Bill</label>
                    <select 
                      name="billRange"
                      value={formData.billRange}
                      onChange={handleChange}
                      className="form-input w-full"
                    >
                      <option value="">Select Bill Range</option>
                      <option value="Below ₹1500">Below ₹1500</option>
                      <option value="₹1500 – ₹2500">₹1500 – ₹2500</option>
                      <option value="₹2500 – ₹4000">₹2500 – ₹4000</option>
                      <option value="₹4000 – ₹8000">₹4000 – ₹8000</option>
                      <option value="Above ₹8000">Above ₹8000</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Message</label>
                    <textarea 
                      rows="4" 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="form-input resize-none"
                      placeholder="Tell us about your requirements..."
                    ></textarea>
                  </div>

                  <button disabled={status === "loading"} className="w-full btn-primary py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer">
                    {status === "loading" ? "Sending..." : "Send Message"} <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" /> Your data is secure. We never spam.
                  </p>
                </form>
              </>
            )}
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
      <label className="form-label">{label}</label>
      <input 
        type={type} 
        className="form-input"
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}
function Success({ onReset }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>

      <h3 className="text-2xl font-bold text-dark mb-2">Message Sent!</h3>

      <p className="text-gray-600 mb-6">
        Thank you for contacting us. We will get back to you shortly.
      </p>

      <button onClick={onReset} className="text-primary font-semibold hover:underline">
        Send another message
      </button>
    </div>
  );
}