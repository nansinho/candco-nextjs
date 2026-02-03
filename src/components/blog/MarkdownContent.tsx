"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import Link from "next/link";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
      ]}
      components={{
        // Custom heading styles
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mt-10 mb-4 text-foreground">
            {children}
          </h1>
        ),
        h2: ({ children, id }) => (
          <h2
            id={id}
            className="text-2xl font-semibold mt-10 mb-4 text-foreground scroll-mt-24"
          >
            {children}
          </h2>
        ),
        h3: ({ children, id }) => (
          <h3
            id={id}
            className="text-xl font-semibold mt-8 mb-3 text-foreground scroll-mt-24"
          >
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-lg font-medium mt-6 mb-2 text-foreground">
            {children}
          </h4>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="text-muted-foreground leading-relaxed mb-4">
            {children}
          </p>
        ),
        // Strong/bold text
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        // Emphasis/italic
        em: ({ children }) => <em className="italic">{children}</em>,
        // Links
        a: ({ href, children }) => {
          const isExternal = href?.startsWith("http");
          if (isExternal) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            );
          }
          return (
            <Link href={href || "#"} className="text-primary hover:underline">
              {children}
            </Link>
          );
        },
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 mb-4 text-muted-foreground">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-2 mb-4 text-muted-foreground">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary pl-4 my-6 italic text-muted-foreground bg-primary/5 py-4 pr-4 rounded-r-lg">
            {children}
          </blockquote>
        ),
        // Code blocks
        code: ({ className, children }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                {children}
              </code>
            );
          }
          return (
            <code className="block bg-secondary p-4 rounded-lg overflow-x-auto text-sm font-mono my-4">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-secondary rounded-lg overflow-x-auto my-4">
            {children}
          </pre>
        ),
        // Horizontal rule
        hr: () => <hr className="border-border my-8" />,
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border border-border rounded-lg overflow-hidden">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-secondary">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-4 py-3 text-left font-semibold text-foreground border-b border-border">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3 text-muted-foreground border-b border-border">
            {children}
          </td>
        ),
        // Images
        img: ({ src, alt }) => (
          <figure className="my-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt || ""}
              className="rounded-lg w-full"
              loading="lazy"
            />
            {alt && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2">
                {alt}
              </figcaption>
            )}
          </figure>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
