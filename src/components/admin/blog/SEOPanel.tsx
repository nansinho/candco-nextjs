"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { analyzeSeo, type SeoCheck } from "@/lib/seo/analyze";
import { suggestInternalLinks, type LinkSuggestion } from "@/lib/seo/internal-links";
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, Link2, Globe, Copy } from "lucide-react";
import { toast } from "sonner";

interface ArticleData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  secondary_keywords?: string[];
  image_url?: string;
}

interface OtherArticle {
  id: string;
  title: string;
  slug: string;
  keywords?: string[] | null;
  category?: string | null;
}

interface SEOPanelProps {
  article: ArticleData;
  articleId?: string;
  allArticles: OtherArticle[];
  onUpdateField: (field: string, value: string | string[]) => void;
}

function ScoreCircle({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-gray-400 font-medium">/ 100</span>
      </div>
    </div>
  );
}

function CheckIcon({ status }: { status: SeoCheck["status"] }) {
  if (status === "good") return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
  if (status === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
  return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
}

function SERPPreview({ title, slug, description }: { title: string; slug: string; description: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-1">
      <p className="text-[10px] text-gray-400 flex items-center gap-1">
        <Globe className="h-3 w-3" /> Aperçu Google
      </p>
      <p className="text-[#1a0dab] text-base font-medium leading-snug line-clamp-1 cursor-pointer hover:underline">
        {title || "Titre de l'article"}
      </p>
      <p className="text-[#006621] text-xs">
        candco-formation.fr/blog/{slug || "url-article"}
      </p>
      <p className="text-[#545454] text-xs leading-relaxed line-clamp-2">
        {description || "Ajoutez une meta description pour voir l'aperçu..."}
      </p>
    </div>
  );
}

export default function SEOPanel({ article, articleId, allArticles, onUpdateField }: SEOPanelProps) {
  const [showAllChecks, setShowAllChecks] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [secondaryInput, setSecondaryInput] = useState("");

  const analysis = useMemo(() => analyzeSeo(article), [article]);

  const linkSuggestions = useMemo(
    () => suggestInternalLinks(article.content || "", articleId, allArticles),
    [article.content, articleId, allArticles]
  );

  const goodChecks = analysis.checks.filter((c) => c.status === "good");
  const issueChecks = analysis.checks.filter((c) => c.status !== "good");
  const displayChecks = showAllChecks ? analysis.checks : issueChecks.slice(0, 5);

  const handleAddSecondaryKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && secondaryInput.trim()) {
      e.preventDefault();
      const current = article.secondary_keywords || [];
      if (!current.includes(secondaryInput.trim())) {
        onUpdateField("secondary_keywords", [...current, secondaryInput.trim()]);
      }
      setSecondaryInput("");
    }
  };

  const handleRemoveSecondaryKeyword = (kw: string) => {
    const current = article.secondary_keywords || [];
    onUpdateField("secondary_keywords", current.filter((k) => k !== kw));
  };

  const copyLinkMarkdown = (suggestion: LinkSuggestion) => {
    const md = `[${suggestion.suggestedAnchorText}](/blog/${suggestion.articleSlug})`;
    navigator.clipboard.writeText(md);
    toast.success("Lien Markdown copié !");
  };

  return (
    <div className="space-y-5">
      {/* Score */}
      <div className="text-center">
        <ScoreCircle score={analysis.score} />
        <p className="text-xs text-gray-500 mt-2">
          {goodChecks.length}/{analysis.checks.length} critères OK
        </p>
      </div>

      {/* Focus keyword */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Mot-clé focus</Label>
        <Input
          value={article.focus_keyword || ""}
          onChange={(e) => onUpdateField("focus_keyword", e.target.value)}
          placeholder="Ex: formation SST entreprise"
          className="bg-[#F6F9FB] border-0 text-sm h-9 focus:ring-1 focus:ring-[#1f628e]/30"
        />
      </div>

      {/* Secondary keywords */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Mots-clés secondaires</Label>
        <Input
          value={secondaryInput}
          onChange={(e) => setSecondaryInput(e.target.value)}
          onKeyDown={handleAddSecondaryKeyword}
          placeholder="Appuyez sur Entrée pour ajouter"
          className="bg-[#F6F9FB] border-0 text-sm h-9 focus:ring-1 focus:ring-[#1f628e]/30"
        />
        {article.secondary_keywords && article.secondary_keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {article.secondary_keywords.map((kw) => (
              <Badge
                key={kw}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-600 transition-colors"
                onClick={() => handleRemoveSecondaryKeyword(kw)}
              >
                {kw} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Meta title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-gray-700">Meta title</Label>
          <span className={`text-[10px] font-mono ${(article.meta_title || "").length >= 50 && (article.meta_title || "").length <= 60 ? "text-green-600" : "text-amber-500"}`}>
            {(article.meta_title || "").length}/60
          </span>
        </div>
        <Input
          value={article.meta_title || ""}
          onChange={(e) => onUpdateField("meta_title", e.target.value)}
          placeholder="Titre pour Google (50-60 car.)"
          className="bg-[#F6F9FB] border-0 text-sm h-9 focus:ring-1 focus:ring-[#1f628e]/30"
        />
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(((article.meta_title || "").length / 60) * 100, 100)}%`,
              backgroundColor: (article.meta_title || "").length >= 50 && (article.meta_title || "").length <= 60 ? "#22c55e" : (article.meta_title || "").length > 60 ? "#ef4444" : "#f59e0b",
            }}
          />
        </div>
      </div>

      {/* Meta description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-gray-700">Meta description</Label>
          <span className={`text-[10px] font-mono ${(article.meta_description || "").length >= 120 && (article.meta_description || "").length <= 155 ? "text-green-600" : "text-amber-500"}`}>
            {(article.meta_description || "").length}/155
          </span>
        </div>
        <Textarea
          value={article.meta_description || ""}
          onChange={(e) => onUpdateField("meta_description", e.target.value)}
          placeholder="Description pour Google (120-155 car.)"
          rows={3}
          className="bg-[#F6F9FB] border-0 text-sm focus:ring-1 focus:ring-[#1f628e]/30"
        />
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(((article.meta_description || "").length / 155) * 100, 100)}%`,
              backgroundColor: (article.meta_description || "").length >= 120 && (article.meta_description || "").length <= 155 ? "#22c55e" : (article.meta_description || "").length > 155 ? "#ef4444" : "#f59e0b",
            }}
          />
        </div>
      </div>

      {/* SERP Preview */}
      <SERPPreview
        title={article.meta_title || article.title || ""}
        slug={article.slug || ""}
        description={article.meta_description || ""}
      />

      {/* Checks */}
      <div>
        <button
          onClick={() => setShowAllChecks(!showAllChecks)}
          className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 mb-2"
        >
          <span>Analyse SEO ({issueChecks.length} à améliorer)</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAllChecks ? "rotate-180" : ""}`} />
        </button>
        <div className="space-y-1.5">
          {displayChecks.map((check) => (
            <div key={check.id} className="flex items-start gap-2 text-xs py-1.5">
              <CheckIcon status={check.status} />
              <div>
                <p className="font-medium text-gray-700">{check.label}</p>
                <p className="text-gray-400">{check.message}</p>
              </div>
            </div>
          ))}
        </div>
        {!showAllChecks && goodChecks.length > 0 && (
          <button
            onClick={() => setShowAllChecks(true)}
            className="text-[11px] text-green-600 mt-2 hover:underline"
          >
            + {goodChecks.length} critères validés
          </button>
        )}
      </div>

      {/* Internal link suggestions */}
      {linkSuggestions.length > 0 && (
        <div>
          <button
            onClick={() => setShowLinks(!showLinks)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2"
          >
            <Link2 className="h-3.5 w-3.5" />
            Suggestions de maillage ({linkSuggestions.length})
            <ChevronDown className={`h-3 w-3 transition-transform ${showLinks ? "rotate-180" : ""}`} />
          </button>
          {showLinks && (
            <div className="space-y-2">
              {linkSuggestions.map((s) => (
                <div
                  key={s.articleSlug}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{s.articleTitle}</p>
                    <p className="text-[10px] text-gray-400 truncate">/blog/{s.articleSlug}</p>
                  </div>
                  <button
                    onClick={() => copyLinkMarkdown(s)}
                    className="shrink-0 p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                    title="Copier le lien Markdown"
                  >
                    <Copy className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
