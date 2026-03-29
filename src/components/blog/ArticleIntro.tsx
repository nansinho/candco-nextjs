import { Quote } from "lucide-react";

interface ArticleIntroProps {
  excerpt: string;
}

export function ArticleIntro({ excerpt }: ArticleIntroProps) {
  return (
    <div className="p-6 rounded-xl border border-gray-100 mb-10" style={{ backgroundColor: "#F5F7FA" }}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(31,98,142,0.1)" }}>
          <Quote className="w-5 h-5" style={{ color: "#1F628E" }} />
        </div>
        <p className="leading-relaxed italic" style={{ color: "#64748b" }}>
          {excerpt}
        </p>
      </div>
    </div>
  );
}
