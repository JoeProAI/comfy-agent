import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ComfyUI Cloud Assistant - Master ComfyUI Workflows",
  description: "Intelligent AI assistant for building, optimizing, and mastering ComfyUI workflows with smart model routing",
  keywords: ["ComfyUI", "AI", "Workflow", "Stable Diffusion", "Assistant"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}