"use client";

import Chatbot from "@/components/Chatbot";
import WhatsappFloat from "@/components/WhatsappFloat";
import Script from "next/script";
import { useEffect } from "react";

export default function PublicLayout({ children }) {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi",
          autoDisplay: false,
        },
        "google_translate_container"
      );
    };
  }, []);

  return (
    <>
      {children}
      <WhatsappFloat />
      <Chatbot />
      <div id="google_translate_container" className="hidden"></div>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
