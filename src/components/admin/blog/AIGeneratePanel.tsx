"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Sparkles, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Formation",
  "Actualités",
  "Conseils",
  "Réglementation",
  "Témoignages",
];

interface AIGeneratePanelProps {
  onGenerated: (data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    meta_title: string;
    meta_description: string;
    focus_keyword: string;
    secondary_keywords: string[];
    keywords: string[];
    read_time: number;
    category: string;
    ai_generated: boolean;
  }) => void;
}

export default function AIGeneratePanel({ onGenerated }: AIGeneratePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("Actualités");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [localSeoCity, setLocalSeoCity] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Veuillez saisir un sujet");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          category,
          targetKeyword: targetKeyword.trim() || undefined,
          localSeoCity: localSeoCity.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur de génération");
      }

      const data = await res.json();
      onGenerated(data);
      toast.success("Article généré avec succès ! Vérifiez et modifiez avant de publier.");
      setIsOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inattendue";
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between p-4 rounded-xl border border-dashed border-[#1F628E]/30 bg-gradient-to-r from-[#0F2D42]/5 to-[#1F628E]/5 hover:from-[#0F2D42]/10 hover:to-[#1F628E]/10 transition-all cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0F2D42] to-[#1F628E] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Générer avec l&apos;IA</p>
              <p className="text-xs text-gray-500">Article optimisé SEO en quelques secondes</p>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          {/* Topic */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Sujet de l&apos;article *</Label>
            <Input
              placeholder="Ex: Les obligations de formation SST en entreprise"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
              className="bg-[#F6F9FB] border-0 focus:ring-1 focus:ring-[#1f628e]/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Catégorie</Label>
              <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
                <SelectTrigger className="bg-[#F6F9FB] border-0 focus:ring-1 focus:ring-[#1f628e]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Keyword */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Mot-clé cible</Label>
              <Input
                placeholder="Ex: formation SST"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                disabled={isGenerating}
                className="bg-[#F6F9FB] border-0 focus:ring-1 focus:ring-[#1f628e]/30"
              />
            </div>

            {/* Local SEO City */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Ville (SEO local)</Label>
              <Input
                placeholder="Ex: Marseille, Aix-en-Provence"
                value={localSeoCity}
                onChange={(e) => setLocalSeoCity(e.target.value)}
                disabled={isGenerating}
                className="bg-[#F6F9FB] border-0 focus:ring-1 focus:ring-[#1f628e]/30"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-gradient-to-r from-[#0F2D42] to-[#1F628E] hover:from-[#0F2D42]/90 hover:to-[#1F628E]/90 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours... (15-30s)
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Générer l&apos;article
              </>
            )}
          </Button>

          <p className="text-[11px] text-gray-400 text-center">
            L&apos;IA génère un brouillon. Relisez et modifiez toujours avant de publier.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
