import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amazon.com. Spend less. Smile more.",
  // A demo clone must stay out of search engines (docs/spec.md section 2, safety notice).
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-us">
      <body>{children}</body>
    </html>
  );
}
