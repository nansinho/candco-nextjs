"use client";

import { useState, useMemo } from "react";
import {
  useFAQCategories,
  useFAQItems,
  useFAQMutations,
  type FAQCategory,
  type FAQItem,
} from "@/hooks/admin/useFAQ";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Loader2,
  FolderOpen,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminFAQ() {
  // State
  const [activeTab, setActiveTab] = useState("items");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "category" | "item"; id: string } | null>(null);

  // Form state
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", icon: "HelpCircle", description: "", display_order: 0, active: true });
  const [itemForm, setItemForm] = useState({ category_id: "", question: "", answer: "", keywords: "", display_order: 0, active: true });

  // Hooks
  const { data: categories = [], isLoading: loadingCategories } = useFAQCategories();
  const { data: items = [], isLoading: loadingItems } = useFAQItems();
  const { createCategory, updateCategory, deleteCategory, createItem, updateItem, deleteItem, toggleItemActive } = useFAQMutations();

  const isLoading = loadingCategories || loadingItems;

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === "all" || item.category_id === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, filterCategory]);

  // Stats
  const stats = useMemo(() => ({
    totalCategories: categories.length,
    activeCategories: categories.filter((c) => c.active).length,
    totalItems: items.length,
    activeItems: items.filter((i) => i.active).length,
    totalViews: items.reduce((acc, i) => acc + i.view_count, 0),
  }), [categories, items]);

  // Get category name helper
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Sans catégorie";
  };

  // Category handlers
  const handleOpenCategoryDialog = (category?: FAQCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        description: category.description || "",
        display_order: category.display_order,
        active: category.active,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "", icon: "HelpCircle", description: "", display_order: categories.length, active: true });
    }
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...categoryForm });
        toast.success("Catégorie mise à jour");
      } else {
        await createCategory.mutateAsync(categoryForm);
        toast.success("Catégorie créée");
      }
      setCategoryDialogOpen(false);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  // Item handlers
  const handleOpenItemDialog = (item?: FAQItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        category_id: item.category_id,
        question: item.question,
        answer: item.answer,
        keywords: item.keywords?.join(", ") || "",
        display_order: item.display_order,
        active: item.active,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        category_id: categories[0]?.id || "",
        question: "",
        answer: "",
        keywords: "",
        display_order: items.length,
        active: true,
      });
    }
    setItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      const keywords = itemForm.keywords.split(",").map((k) => k.trim()).filter(Boolean);
      if (editingItem) {
        await updateItem.mutateAsync({ id: editingItem.id, ...itemForm, keywords });
        toast.success("Question mise à jour");
      } else {
        await createItem.mutateAsync({ ...itemForm, keywords });
        toast.success("Question créée");
      }
      setItemDialogOpen(false);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "category") {
        await deleteCategory.mutateAsync(deleteTarget.id);
        toast.success("Catégorie supprimée");
      } else {
        await deleteItem.mutateAsync(deleteTarget.id);
        toast.success("Question supprimée");
      }
      setDeleteTarget(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        icon={HelpCircle}
        title="FAQ"
        description="Gérez les questions fréquentes et leurs catégories"
      >
        <Button onClick={() => activeTab === "categories" ? handleOpenCategoryDialog() : handleOpenItemDialog()} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === "categories" ? "Catégorie" : "Question"}
        </Button>
      </AdminPageHeader>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-0 bg-secondary/30">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Catégories</p>
              <p className="text-2xl font-semibold">{stats.totalCategories}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Cat. actives</p>
              <p className="text-2xl font-semibold text-green-500">{stats.activeCategories}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Questions</p>
              <p className="text-2xl font-semibold">{stats.totalItems}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Q. actives</p>
              <p className="text-2xl font-semibold text-green-500">{stats.activeItems}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Vues totales</p>
              <p className="text-2xl font-semibold text-blue-500">{stats.totalViews}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">
            <HelpCircle className="h-4 w-4 mr-2" />
            Questions ({items.length})
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FolderOpen className="h-4 w-4 mr-2" />
            Catégories ({categories.length})
          </TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="items" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une question..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="Aucune question"
              description={search ? "Aucune question ne correspond" : "Ajoutez une première question FAQ"}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className={adminStyles.tableRowHeader}>
                    <TableHead className={adminStyles.tableHead}>Question</TableHead>
                    <TableHead className={adminStyles.tableHead}>Catégorie</TableHead>
                    <TableHead className={`${adminStyles.tableHead} text-center`}>Stats</TableHead>
                    <TableHead className={`${adminStyles.tableHead} text-center`}>Actif</TableHead>
                    <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} className={adminStyles.tableRowClickable}>
                      <TableCell className={adminStyles.tableCell}>
                        <p className="font-medium truncate max-w-[300px]">{item.question}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">{item.answer.slice(0, 80)}...</p>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(item.category_id)}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${adminStyles.tableCell} text-center`}>
                        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {item.view_count}
                          </span>
                          <span className="flex items-center gap-1 text-green-500">
                            <ThumbsUp className="h-3 w-3" /> {item.helpful_count}
                          </span>
                          <span className="flex items-center gap-1 text-red-500">
                            <ThumbsDown className="h-3 w-3" /> {item.not_helpful_count}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={`${adminStyles.tableCell} text-center`}>
                        <Switch
                          checked={item.active}
                          onCheckedChange={(checked) => toggleItemActive.mutate({ id: item.id, active: checked })}
                        />
                      </TableCell>
                      <TableCell className={`${adminStyles.tableCell} text-right`}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenItemDialog(item)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: "item", id: item.id })}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Aucune catégorie"
              description="Créez une première catégorie FAQ"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const catItems = items.filter((i) => i.category_id === cat.id);
                return (
                  <Card key={cat.id} className="border-0 bg-secondary/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">{cat.name}</CardTitle>
                        </div>
                        <Badge variant={cat.active ? "default" : "secondary"} className="text-xs">
                          {cat.active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {cat.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{cat.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{catItems.length} questions</span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenCategoryDialog(cat)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: "category", id: cat.id })}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={categoryForm.active} onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, active: checked })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveCategory} disabled={createCategory.isPending || updateCategory.isPending}>
              {(createCategory.isPending || updateCategory.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier la question" : "Nouvelle question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={itemForm.category_id} onValueChange={(value) => setItemForm({ ...itemForm, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Question</Label>
              <Input value={itemForm.question} onChange={(e) => setItemForm({ ...itemForm, question: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Réponse</Label>
              <Textarea rows={4} value={itemForm.answer} onChange={(e) => setItemForm({ ...itemForm, answer: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Mots-clés (séparés par des virgules)</Label>
              <Input value={itemForm.keywords} onChange={(e) => setItemForm({ ...itemForm, keywords: e.target.value })} placeholder="mot1, mot2, mot3" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={itemForm.active} onCheckedChange={(checked) => setItemForm({ ...itemForm, active: checked })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveItem} disabled={createItem.isPending || updateItem.isPending}>
              {(createItem.isPending || updateItem.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {deleteTarget?.type === "category" ? "cette catégorie" : "cette question"} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
              {deleteTarget?.type === "category" && " Toutes les questions associées seront également supprimées."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
