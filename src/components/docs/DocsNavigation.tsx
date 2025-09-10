"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    title: "はじめに",
    items: [
      { title: "概要", href: "/docs" },
      { title: "基本的な使い方", href: "/docs/getting-started" },
    ],
  },
  {
    title: "実装済み機能",
    items: [
      { title: "テキストチャット", href: "/docs/text-chat" },
      { title: "ファイル共有", href: "/docs/file-sharing" },
      { title: "カレンダー", href: "/docs/calendar" },
    ],
  },
];

export function DocsNavigation() {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(["はじめに"]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <nav className="sticky top-24 h-fit">
      <div className="space-y-2">
        {navigation.map((section) => {
          const isExpanded = expandedSections.includes(section.title);
          return (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {section.title}
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
                        pathname === item.href && "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}