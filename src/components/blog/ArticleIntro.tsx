import { Quote } from "lucide-react";

interface ArticleIntroProps {
  excerpt: string;
}

export function ArticleIntro({ excerpt }: ArticleIntroProps) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border mb-8">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Quote className="w-5 h-5 text-primary" />
        </div>
        <p className="text-muted-foreground leading-relaxed italic">
          {excerpt}
        </p>
      </div>
    </div>
  );
}
