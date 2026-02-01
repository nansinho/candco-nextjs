"use client";

/**
 * @file DevRequestDialog.tsx
 * @description Dialog de création d'une nouvelle demande de développement
 */

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Users } from "lucide-react";
import { useCreateDevRequest, useAdminUsers } from "@/hooks/admin/useDevRequests";
import { ImageDropZone } from "./ImageDropZone";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  priority: z.enum(["basse", "moyenne", "haute", "urgente"]).default("moyenne"),
});

type FormValues = z.infer<typeof formSchema>;

interface DevRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DevRequestDialog({ open, onOpenChange }: DevRequestDialogProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const createRequest = useCreateDevRequest();
  const { data: adminUsers, isLoading: isLoadingAdmins } = useAdminUsers();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      priority: "moyenne",
    },
  });

  const handleImagesChange = useCallback((newImages: File[], newPreviews: string[]) => {
    setImages(newImages);
    setPreviews(newPreviews);
  }, []);

  const toggleAssignee = useCallback((userId: string, checked: boolean | "indeterminate") => {
    setSelectedAssignees(prev =>
      checked === true
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  }, []);

  const handleSubmit = async (values: FormValues) => {
    await createRequest.mutateAsync({
      title: values.title,
      description: values.description,
      priority: values.priority,
      images,
      assigned_to: selectedAssignees.length > 0 ? selectedAssignees : undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    form.reset();
    setImages([]);
    previews.forEach(p => URL.revokeObjectURL(p));
    setPreviews([]);
    setSelectedAssignees([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle demande</DialogTitle>
          <DialogDescription>
            Décrivez votre demande de développement ou signalement de bug.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ajouter un bouton d'export PDF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorité</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une priorité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basse">🟢 Basse</SelectItem>
                      <SelectItem value="moyenne">🟡 Moyenne</SelectItem>
                      <SelectItem value="haute">🟠 Haute</SelectItem>
                      <SelectItem value="urgente">🔴 Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sélection des assignés */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Assigner à (optionnel)
              </label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                {isLoadingAdmins ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : adminUsers && adminUsers.length > 0 ? (
                  <div className="space-y-2">
                    {adminUsers.map((admin) => {
                      const initials = `${admin.first_name?.[0] || ''}${admin.last_name?.[0] || ''}`.toUpperCase() || '??';
                      const fullName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Utilisateur';
                      const isChecked = selectedAssignees.includes(admin.id);

                      return (
                        <label
                          key={admin.id}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => toggleAssignee(admin.id, checked)}
                          />
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{fullName}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Aucun administrateur disponible
                  </p>
                )}
              </div>
              {selectedAssignees.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedAssignees.length} personne(s) sélectionnée(s)
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre demande en détail..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Zone d'upload d'images */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Images (optionnel)</label>
              <ImageDropZone
                images={images}
                previews={previews}
                onImagesChange={handleImagesChange}
                maxImages={10}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer la demande"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
