"use client";

/**
 * @file AddColumnButton.tsx
 * @description Bouton pour ajouter une nouvelle colonne au Kanban
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCreateDevRequestColumn } from "@/hooks/admin/useDevRequests";

const COLUMN_COLORS = [
  { name: "Bleu", value: "blue", class: "bg-blue-500" },
  { name: "Violet", value: "purple", class: "bg-purple-500" },
  { name: "Ambre", value: "amber", class: "bg-amber-500" },
  { name: "Vert", value: "green", class: "bg-green-500" },
  { name: "Rouge", value: "red", class: "bg-red-500" },
  { name: "Gris", value: "gray", class: "bg-gray-500" },
];

export function AddColumnButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("gray");

  const createColumn = useCreateDevRequestColumn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    createColumn.mutate(
      {
        name: name.trim(),
        slug,
        color,
        position: 100,
      },
      {
        onSuccess: () => {
          setName("");
          setColor("gray");
          setOpen(false);
        },
      }
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto min-h-[150px] w-[80px] shrink-0",
            "border-2 border-dashed border-muted-foreground/30",
            "hover:border-primary hover:bg-primary/5",
            "flex flex-col items-center justify-center gap-2",
            "transition-all duration-200"
          )}
        >
          <Plus className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Ajouter</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="column-name">Nom de la colonne</Label>
            <Input
              id="column-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: En attente"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {COLUMN_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all",
                    c.class,
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "hover:scale-110"
                  )}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || createColumn.isPending}
          >
            {createColumn.isPending ? "Création..." : "Créer la colonne"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
