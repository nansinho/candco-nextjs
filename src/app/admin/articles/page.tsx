"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useArticles, useArticleMutations, type Article } from "@/hooks/admin/useArticles";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Star,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminArticles() {
  const router = useRouter();
  const { data: articles = [], isLoading } = useArticles();
  const { togglePublished, toggleFeatured, deleteArticle } = useArticleMutations();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.category?.toLowerCase().includes(search.toLowerCase()) ||
        a.author?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "published" && a.published) ||
        (filterStatus === "draft" && !a.published) ||
        (filterStatus === "featured" && a.featured);

      return matchesSearch && matchesStatus;
    });
  }, [articles, search, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    total: articles.length,
    publiés: articles.filter((a) => a.published).length,
    brouillons: articles.filter((a) => !a.published).length,
    featured: articles.filter((a) => a.featured).length,
  }), [articles]);

  const handleTogglePublished = async (article: Article) => {
    await togglePublished.mutateAsync({ id: article.id, published: !article.published });
  };

  const handleToggleFeatured = async (article: Article) => {
    await toggleFeatured.mutateAsync({ id: article.id, featured: !article.featured });
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;

    setDeleting(true);
    try {
      await deleteArticle.mutateAsync(articleToDelete.id);
      setArticleToDelete(null);
    } catch (error) {
      console.error("Error deleting article:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        icon={FileText}
        title="Articles"
        description="Gérez les articles du blog"
      >
        <Button size="sm" onClick={() => router.push("/admin/articles/new")}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nouvel article</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </AdminPageHeader>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 bg-secondary/30">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Publiés</p>
              <p className="text-2xl font-semibold text-green-600">{stats.publiés}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Brouillons</p>
              <p className="text-2xl font-semibold text-muted-foreground">{stats.brouillons}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">En vedette</p>
              <p className="text-2xl font-semibold text-amber-600">{stats.featured}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="featured">En vedette</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun article"
          description={search ? "Aucun article ne correspond à votre recherche" : "Créez votre premier article de blog"}
          action={
            !search && (
              <Button onClick={() => router.push("/admin/articles/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel article
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={adminStyles.tableHead}>Article</TableHead>
                  <TableHead className={adminStyles.tableHead}>Catégorie</TableHead>
                  <TableHead className={adminStyles.tableHead}>Date</TableHead>
                  <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow
                    key={article.id}
                    className={adminStyles.tableRowClickable}
                    onClick={() => router.push(`/admin/articles/${article.id}`)}
                  >
                    <TableCell className={adminStyles.tableCell}>
                      <div className="flex items-center gap-3">
                        {article.image_url ? (
                          <div className="w-16 h-10 rounded-md overflow-hidden shrink-0 bg-muted">
                            <Image
                              src={article.image_url}
                              alt={article.title}
                              width={64}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate max-w-[250px]">{article.title}</p>
                            {article.featured && (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          {article.author && (
                            <p className="text-xs text-muted-foreground">
                              par {article.author}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      {article.category ? (
                        <Badge variant="secondary">{article.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(article.created_at), "d MMM yyyy", { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <Badge
                        variant="outline"
                        className={article.published
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-muted text-muted-foreground border-border/30"
                        }
                      >
                        {article.published ? (
                          <><Eye className="h-3 w-3 mr-1" /> Publié</>
                        ) : (
                          <><EyeOff className="h-3 w-3 mr-1" /> Brouillon</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className={`${adminStyles.tableCell} text-right`}>
                      <div
                        className="flex items-center justify-end gap-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className={adminStyles.tableActionButton}
                          onClick={() => handleTogglePublished(article)}
                          title={article.published ? "Dépublier" : "Publier"}
                        >
                          {article.published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={adminStyles.tableActionButton}
                          onClick={() => handleToggleFeatured(article)}
                          title={article.featured ? "Retirer des vedettes" : "Mettre en vedette"}
                        >
                          <Star className={`h-3 w-3 ${article.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={adminStyles.tableActionButton}
                          onClick={() => router.push(`/admin/articles/${article.id}`)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${adminStyles.tableActionButton} text-destructive`}
                          onClick={() => setArticleToDelete(article)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="border-0 bg-secondary/30 cursor-pointer overflow-hidden"
                onClick={() => router.push(`/admin/articles/${article.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {article.image_url ? (
                      <div className="w-24 h-24 shrink-0 bg-muted">
                        <Image
                          src={article.image_url}
                          alt={article.title}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 shrink-0 bg-muted flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{article.title}</p>
                            {article.featured && (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          {article.category && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {article.category}
                            </Badge>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={article.published
                            ? "bg-green-500/10 text-green-600 border-green-500/20 shrink-0"
                            : "bg-muted text-muted-foreground border-border/30 shrink-0"
                          }
                        >
                          {article.published ? "Publié" : "Brouillon"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(parseISO(article.created_at), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!articleToDelete} onOpenChange={() => setArticleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
            <AlertDialogDescription>
              {articleToDelete && (
                <>
                  Vous êtes sur le point de supprimer{" "}
                  <strong>{articleToDelete.title}</strong>.
                  Cette action est irréversible.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
