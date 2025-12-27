import "./globals.css";

export const metadata = {
  title: "Tiranga Green Energy Solutions",
  description:
    "Clean, affordable, and sustainable solar energy solutions for homes and businesses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
