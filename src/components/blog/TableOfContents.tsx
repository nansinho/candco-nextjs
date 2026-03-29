"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(markdown: string): TOCItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    headings.push({ id, text, level });
  }

  return headings;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const headings = extractHeadings(content);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -66%",
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-24">
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: "1px solid #e5e7eb" }}>
        <List className="w-4 h-4" style={{ color: "#1F628E" }} />
        <span className="font-bold text-[13px]" style={{ color: "#151F2D" }}>Sommaire</span>
      </div>
      <ul className="space-y-1.5">
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.level === 3 && "ml-4")}>
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "text-left text-[13px] leading-relaxed transition-all w-full px-3 py-1.5 rounded-lg",
                activeId === heading.id
                  ? "font-bold"
                  : "hover:text-[#1F628E]"
              )}
              style={
                activeId === heading.id
                  ? { color: "#1F628E", backgroundColor: "rgba(31,98,142,0.1)" }
                  : { color: "#94a3b8" }
              }
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
