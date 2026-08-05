import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/ui/Nav";

export const metadata: Metadata = {
  title: "Org Brain",
  description:
    "An Obsidian-style typed org knowledge graph with an @-mention RAG copilot powered by Claude.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen flex-col overflow-hidden">
        <Nav />
        <main className="min-h-0 flex-1">{children}</main>
      </body>
    </html>
  );
}
