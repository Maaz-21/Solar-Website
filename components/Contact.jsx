"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    pincode: "",
    billRange: ""
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
        setFormData({ name: "", phone: "", email: "", city: "", pincode: "", billRange: "" });
      } else {
        setStatus("error");
        alert("Failed to submit enquiry: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      setStatus("error");
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="section bg-green-50">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

        {/* LEFT: Explanation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-primary text-sm font-semibold mb-4">
            Free Consultation
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-6 leading-tight">
            Talk to a solar expert — <br/>
            <span className="text-primary">no pressure, no spam</span>
          </h2>

          <p className="text-gray-600 max-w-xl mb-10 text-lg">
            Get a clear, honest recommendation based on your roof, electricity
            usage, and location. Book only if it makes sense for you.
          </p>

          {/* Steps */}
          <div className="space-y-8 relative">
            {/* Connecting Line */}
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 -z-10"></div>

            <Step
              number="01"
              title="Share basic details"
              desc="Tell us your electricity usage and location — takes less than a minute."
            />
            <Step
              number="02"
              title="Free solar assessment"
              desc="Our expert checks feasibility, savings, and subsidy eligibility."
            />
            <Step
              number="03"
              title="Get a clear plan"
              desc="Receive a customized solar plan with pricing and savings estimate."
            />
          </div>

          {/* Trust note */}
          <div className="flex flex-wrap gap-4 mt-10 text-sm font-medium text-gray-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> No sales calls</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> No obligation</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-primary" /> Data kept private</span>
          </div>
        </motion.div>

        {/* RIGHT: Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100"
        >
          {status === "success" ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-2">Request Received!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for your interest. Our solar expert will contact you shortly.
              </p>
              <button 
                onClick={() => setStatus("")}
                className="text-primary font-semibold hover:underline"
              >
                Submit another enquiry
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-dark mb-6">
                Schedule a free consultation
              </h3>

              <form className="space-y-5" onSubmit={handleSubmit}>

                <Input label="Full name" required placeholder="John Doe" name="name" value={formData.name} onChange={handleChange} />
                <Input label="WhatsApp number" required placeholder="+91 98765 43210" name="phone" value={formData.phone} onChange={handleChange} />

                {/* Bill range */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Monthly electricity bill
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Below ₹1500",
                      "₹1500 – ₹2500",
                      "₹2500 – ₹4000",
                      "₹4000 – ₹8000",
                      "Above ₹8000",
                    ].map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setFormData({ ...formData, billRange: item })}
                        className={`px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-primary/20 ${formData.billRange === item ? 'border-primary bg-green-50 text-primary' : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:bg-green-50'}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Pin code" required placeholder="411001" name="pincode" value={formData.pincode} onChange={handleChange} />
                  <Input label="City" placeholder="Pune" name="city" value={formData.city} onChange={handleChange} />
                </div>

                <Input label="Email (optional)" placeholder="john@example.com" name="email" value={formData.email} onChange={handleChange} />

                {/* Submit */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={status === "loading"}
                  className="btn-primary w-full py-3.5 text-base font-semibold shadow-lg shadow-green-900/10 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {status === "loading" ? "Submitting..." : "Get my solar assessment"} <ArrowRight className="w-4 h-4" />
                </motion.button>

                {/* Consent */}
                <p className="text-xs text-gray-400 text-center mt-4">
                  By submitting, you agree to be contacted regarding your enquiry.
                </p>

              </form>
            </>
          )}
        </motion.div>

      </div>
    </section>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="flex gap-5 items-start bg-white/50 p-2 rounded-xl">
      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-green-900/10 z-10 relative">
        {number}
      </div>
      <div>
        <h4 className="font-bold text-dark text-lg mb-1">{title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Input({ label, required, placeholder, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        required={required}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}
