"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
// Card components removed — using native divs with design system styles
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Eye,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import AIGeneratePanel from "@/components/admin/blog/AIGeneratePanel";
import SEOPanel from "@/components/admin/blog/SEOPanel";
import { useArticles } from "@/hooks/admin/useArticles";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  author: string | null;
  category: string | null;
  image_url: string | null;
  published: boolean;
  featured: boolean;
  read_time: number | null;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  secondary_keywords: string[] | null;
  keywords: string[] | null;
  seo_score: number | null;
  social_linkedin_text: string | null;
  social_facebook_text: string | null;
  ai_generated: boolean | null;
  created_at: string;
  updated_at: string | null;
}

const CATEGORIES = [
  "Formation",
  "Actualités",
  "Conseils",
  "Réglementation",
  "Témoignages",
];

export default function AdminArticleDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [article, setArticle] = useState<Partial<Article>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    category: "Actualités",
    published: false,
    featured: false,
  });
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const supabase = createClient();
  const { data: allArticles } = useArticles();

  useEffect(() => {
    if (!isNew && id) {
      fetchArticle();
    }
  }, [id, isNew]);

  const fetchArticle = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("blog_articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Article non trouvé");
      router.push("/admin/articles");
      return;
    }

    setArticle(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!article.title || !article.slug) {
      toast.error("Le titre et le slug sont requis");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...article,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { data, error } = await supabase
          .from("blog_articles")
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        toast.success("Article créé");
        router.push(`/admin/articles/${data.id}`);
      } else {
        const { error } = await supabase
          .from("blog_articles")
          .update(dataToSave)
          .eq("id", id);

        if (error) throw error;
        toast.success("Article mis à jour");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("blog_articles").delete().eq("id", id);
      if (error) throw error;
      toast.success("Article supprimé");
      router.push("/admin/articles");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const updateField = (field: keyof Article, value: unknown) => {
    setArticle((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-[#cbd8e3]/50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles">
            <button className="h-9 w-9 rounded-lg flex items-center justify-center text-[#5a7a8f] hover:text-[#0e2438] hover:bg-[#e4edf3] transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-[#0e2438]">
              {isNew ? "Nouvel article" : article.title}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={article.published ? "default" : "secondary"} className="text-[10px]">
                {article.published ? "Publié" : "Brouillon"}
              </Badge>
              {article.featured && <Badge variant="outline" className="bg-amber-500/10 text-amber-600 text-[10px]">À la une</Badge>}
              {article.category && <Badge variant="outline" className="text-[10px]">{article.category}</Badge>}
              {!isNew && (
                <span className="text-[11px] text-[#5a7a8f]">
                  Créé le {new Date(article.created_at!).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && article.published && (
            <Link href={`/blog/${article.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="border-[#cbd8e3] text-[#5a7a8f] hover:text-[#0e2438]">
                <Eye className="h-4 w-4 mr-2" />
                Voir
              </Button>
            </Link>
          )}
          {!isNew && (
            <Button variant="outline" size="sm" className="text-destructive border-[#cbd8e3]" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#1f628e] hover:bg-[#1a5276] text-white">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* AI Generate Panel */}
      {isNew && (
        <AIGeneratePanel
          onGenerated={(data) => {
            setArticle((prev) => ({
              ...prev,
              title: data.title,
              slug: data.slug,
              excerpt: data.excerpt,
              content: data.content,
              meta_title: data.meta_title,
              meta_description: data.meta_description,
              focus_keyword: data.focus_keyword,
              secondary_keywords: data.secondary_keywords,
              keywords: data.keywords,
              read_time: data.read_time,
              category: data.category,
              ai_generated: data.ai_generated,
            }));
          }}
        />
      )}

      {/* AI badge */}
      {article.ai_generated && (
        <div className="flex items-center gap-2 text-xs text-[#1F628E] bg-[#1F628E]/10 px-3 py-1.5 rounded-lg w-fit">
          <Sparkles className="h-3.5 w-3.5" />
          Article généré par IA — Vérifiez le contenu avant de publier
        </div>
      )}

      {/* Main content */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column - Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-[#cbd8e3]/50 bg-white shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#0e2438]">Contenu</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5a7a8f]">Titre *</label>
              <Input
                value={article.title || ""}
                onChange={(e) => {
                  updateField("title", e.target.value);
                  if (isNew && !article.slug) {
                    updateField("slug", generateSlug(e.target.value));
                  }
                }}
                className="bg-[#F6F9FB] border-0 text-[#0e2438] focus:ring-1 focus:ring-[#1f628e]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5a7a8f]">Slug (URL) *</label>
              <Input
                value={article.slug || ""}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="mon-article"
                className="bg-[#F6F9FB] border-0 text-[#0e2438] focus:ring-1 focus:ring-[#1f628e]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5a7a8f]">Extrait</label>
              <Textarea
                value={article.excerpt || ""}
                onChange={(e) => updateField("excerpt", e.target.value)}
                rows={3}
                placeholder="Résumé court de l'article..."
                className="bg-[#F6F9FB] border-0 text-[#0e2438] focus:ring-1 focus:ring-[#1f628e]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5a7a8f]">Contenu (Markdown)</label>
              <Textarea
                value={article.content || ""}
                onChange={(e) => updateField("content", e.target.value)}
                rows={18}
                placeholder="## Mon sous-titre&#10;&#10;Contenu de l'article..."
                className="font-mono text-sm bg-[#F6F9FB] border-0 text-[#0e2438] focus:ring-1 focus:ring-[#1f628e]/30"
              />
            </div>
          </div>
        </div>

        {/* Right column - Settings */}
        <div className="space-y-4">
          {/* Publication */}
          <div className="rounded-xl border border-[#cbd8e3]/50 bg-white shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#0e2438]">Publication</h3>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#5a7a8f]">Publié</label>
              <Switch checked={article.published} onCheckedChange={(v) => updateField("published", v)} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#5a7a8f]">À la une</label>
              <Switch checked={article.featured} onCheckedChange={(v) => updateField("featured", v)} />
            </div>
          </div>

          {/* Métadonnées */}
          <div className="rounded-xl border border-[#cbd8e3]/50 bg-white shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#0e2438]">Métadonnées</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5a7a8f]">Catégorie</label>
              <Select value={article.category || ""} onValueChange={(v) => updateField("category", v)}>
                <SelectTrigger className="bg-[#F6F9FB] border-0">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5a7a8f]">Auteur</label>
              <Input
                value={article.author || ""}
                onChange={(e) => updateField("author", e.target.value)}
                placeholder="Nom de l'auteur"
                className="bg-[#F6F9FB] border-0 text-[#0e2438] focus:ring-1 focus:ring-[#1f628e]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5a7a8f]">Temps de lecture (min)</label>
              <Input
                type="number"
                value={article.read_time || ""}
                onChange={(e) => updateField("read_time", parseInt(e.target.value) || null)}
                placeholder="5"
                className="bg-[#F6F9FB] border-0 text-[#0e2438] focus:ring-1 focus:ring-[#1f628e]/30"
              />
            </div>
          </div>

          {/* Image */}
          <div className="rounded-xl border border-[#cbd8e3]/50 bg-white shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#0e2438] flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#5a7a8f]" />
              Image
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5a7a8f]">URL de l&apos;image</label>
              <Input
                value={article.image_url || ""}
                onChange={(e) => updateField("image_url", e.target.value)}
                placeholder="https://..."
                className="bg-[#F6F9FB] border-0 text-[#0e2438] focus:ring-1 focus:ring-[#1f628e]/30"
              />
            </div>
            {article.image_url && (
              <div className="aspect-video rounded-lg overflow-hidden bg-[#e4edf3]">
                <img src={article.image_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* SEO Panel */}
          <div className="rounded-xl border border-[#cbd8e3]/50 bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#0e2438] mb-4">SEO — Analyse Rank Math</h3>
              <SEOPanel
                article={{
                  title: article.title || "",
                  slug: article.slug || "",
                  content: article.content || "",
                  excerpt: article.excerpt || "",
                  meta_title: article.meta_title || "",
                  meta_description: article.meta_description || "",
                  focus_keyword: article.focus_keyword || "",
                  secondary_keywords: article.secondary_keywords || [],
                  image_url: article.image_url || "",
                }}
                articleId={isNew ? undefined : id}
                allArticles={(allArticles || []).map((a) => ({
                  id: a.id,
                  title: a.title,
                  slug: a.slug,
                  keywords: a.keywords,
                  category: a.category,
                }))}
                onUpdateField={(field, value) => updateField(field as keyof Article, value)}
              />
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
