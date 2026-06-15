import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "OmniShield - Fraud Fingerprinting & Network Sandbox",
  description: "Advanced multi-channel banking fraud detection MVP simulating IP velocity, device fingerprinting, emulator checks, and automated compliance SAR compilation.",
};

import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="h-screen flex bg-background text-foreground font-sans overflow-hidden">
        <ThemeProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
