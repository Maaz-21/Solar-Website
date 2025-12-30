"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hi! I'm your solar assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [showCta, setShowCta] = useState(false);  // ✅ Renamed from showForm
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/faq");
      const data = await res.json();
      if (data.success) {
        setFaqs(data.data);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setInput("");

    // Simple matching logic
    const match = faqs.find((faq) =>
      faq.question.toLowerCase().includes(userMessage.toLowerCase()) ||
      faq.answer.toLowerCase().includes(userMessage.toLowerCase())
    );

    if (match) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: match.answer },
        ]);
        setShowCta(false);  // ✅ Hide CTA on FAQ match
      }, 500);
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "I couldn't find an answer to that. Would you like to leave an enquiry?",
          },
        ]);
        setShowCta(true);  // ✅ Show CTA (not form)
      }, 500);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all ${
          isOpen ? "hidden" : "block"
        }`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[600px]"
          >
            {/* Header */}
            <div className="bg-orange-500 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <h3 className="font-semibold">Solar Assistant</h3>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCta(false);  // ✅ Reset CTA when closing
                }}
                className="hover:bg-orange-600 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.type === "user"
                        ? "bg-orange-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* ✅ CTA Section - NO FORM */}
              {showCta && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3 text-center">
                  <p className="text-sm font-medium text-gray-700 mb-4">
                    Connect with our experts directly:
                  </p>
                  <Link 
                    href="/contact"
                    className="block w-full bg-orange-500 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all shadow-md"
                    onClick={() => setIsOpen(false)}  // ✅ Close chat on click
                  >
                    🚀 Go to Contact Page
                  </Link>
                  <button
                    type="button"  // ✅ Explicit type="button"
                    onClick={() => setShowCta(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline mt-2"
                  >
                    Ask another question
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Always visible */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="flex-1 p-2 border rounded-full px-4 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
