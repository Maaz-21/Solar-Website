import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Load GTM */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
      </body>
    </html>
  );
}
