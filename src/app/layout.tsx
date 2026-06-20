import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NIKPanel — High-Performance VPS Hosting",
  description:
    "High-performance KVM VPS hosting with CyberPanel and Docker pre-installed. Built for developers and businesses.",
  keywords: "VPS hosting, KVM VPS, CyberPanel, Docker, AlmaLinux, NIKPanel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
