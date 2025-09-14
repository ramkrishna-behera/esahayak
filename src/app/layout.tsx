// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Buyer Lead Intake App",
  description: "Mini app to capture and manage buyer leads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-50 text-gray-900">
        <ThemeProvider attribute="class" defaultTheme="system">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto ">{children}</main>
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
