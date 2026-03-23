import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "StudyTracker – Your Learning Hub",
  description: "Track your projects, subjects, and study sessions with an elegant all-in-one dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#16161d",
                color: "#e8eaf0",
                border: "1px solid #2a2a38",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
