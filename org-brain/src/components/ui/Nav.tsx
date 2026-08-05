"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, MessageSquare, Network } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/ai-brains/org", label: "Org Graph", icon: Network },
  { href: "/copilot-employee", label: "Copilot", icon: MessageSquare },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="flex h-14 shrink-0 items-center gap-6 border-b border-border bg-panel px-4">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Brain className="h-5 w-5 text-accent" />
        <span>Org Brain</span>
      </Link>
      <nav className="flex items-center gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg",
                active && "bg-white/5 text-fg",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
