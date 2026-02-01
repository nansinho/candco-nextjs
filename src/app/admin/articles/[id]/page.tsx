"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/articles">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-medium">
              {isNew ? "Nouvel article" : article.title}
            </h1>
            {!isNew && (
              <p className="text-sm text-muted-foreground">
                Créé le {new Date(article.created_at!).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && article.published && (
            <Link href={`/blog/${article.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Voir
              </Button>
            </Link>
          )}
          {!isNew && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2">
        <Badge variant={article.published ? "default" : "secondary"}>
          {article.published ? "Publié" : "Brouillon"}
        </Badge>
        {article.featured && <Badge variant="outline" className="bg-amber-500/10 text-amber-600">À la une</Badge>}
        {article.category && <Badge variant="outline">{article.category}</Badge>}
      </div>

      {/* Main content */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column - Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contenu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input
                  value={article.title || ""}
                  onChange={(e) => {
                    updateField("title", e.target.value);
                    if (isNew && !article.slug) {
                      updateField("slug", generateSlug(e.target.value));
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL) *</Label>
                <Input
                  value={article.slug || ""}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="mon-article"
                />
              </div>
              <div className="space-y-2">
                <Label>Extrait</Label>
                <Textarea
                  value={article.excerpt || ""}
                  onChange={(e) => updateField("excerpt", e.target.value)}
                  rows={3}
                  placeholder="Résumé court de l'article..."
                />
              </div>
              <div className="space-y-2">
                <Label>Contenu (Markdown)</Label>
                <Textarea
                  value={article.content || ""}
                  onChange={(e) => updateField("content", e.target.value)}
                  rows={15}
                  placeholder="# Mon titre\n\nContenu de l'article..."
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Settings */}
        <div className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Publié</Label>
                <Switch
                  checked={article.published}
                  onCheckedChange={(v) => updateField("published", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>À la une</Label>
                <Switch
                  checked={article.featured}
                  onCheckedChange={(v) => updateField("featured", v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={article.category || ""} onValueChange={(v) => updateField("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Auteur</Label>
                <Input
                  value={article.author || ""}
                  onChange={(e) => updateField("author", e.target.value)}
                  placeholder="Nom de l'auteur"
                />
              </div>
              <div className="space-y-2">
                <Label>Temps de lecture (min)</Label>
                <Input
                  type="number"
                  value={article.read_time || ""}
                  onChange={(e) => updateField("read_time", parseInt(e.target.value) || null)}
                  placeholder="5"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL de l'image</Label>
                <Input
                  value={article.image_url || ""}
                  onChange={(e) => updateField("image_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              {article.image_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={article.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta titre</Label>
                <Input
                  value={article.meta_title || ""}
                  onChange={(e) => updateField("meta_title", e.target.value)}
                  placeholder={article.title || "Titre SEO"}
                />
              </div>
              <div className="space-y-2">
                <Label>Meta description</Label>
                <Textarea
                  value={article.meta_description || ""}
                  onChange={(e) => updateField("meta_description", e.target.value)}
                  rows={3}
                  placeholder="Description pour les moteurs de recherche..."
                />
              </div>
            </CardContent>
          </Card>
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
