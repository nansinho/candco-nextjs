"use client";

/**
 * @file ImageDropZone.tsx
 * @description Composant réutilisable pour l'upload d'images avec drag & drop
 */

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropZoneProps {
  images: File[];
  previews: string[];
  onImagesChange: (images: File[], previews: string[]) => void;
  maxImages?: number;
  compact?: boolean;
  className?: string;
}

export function ImageDropZone({
  images,
  previews,
  onImagesChange,
  maxImages = 10,
  compact = false,
  className,
}: ImageDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback((files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const remainingSlots = maxImages - images.length;
    const filesToAdd = imageFiles.slice(0, remainingSlots);

    if (filesToAdd.length === 0) return;

    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
    onImagesChange(
      [...images, ...filesToAdd],
      [...previews, ...newPreviews]
    );
  }, [images, previews, maxImages, onImagesChange]);

  const removeImage = useCallback((index: number) => {
    URL.revokeObjectURL(previews[index]);
    onImagesChange(
      images.filter((_, i) => i !== index),
      previews.filter((_, i) => i !== index)
    );
  }, [images, previews, onImagesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  }, [addImages]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addImages]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const canAddMore = images.length < maxImages;

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative w-14 h-14 group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {canAddMore && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={cn(
              "flex items-center gap-2 px-3 py-2 border border-dashed rounded-md cursor-pointer transition-colors",
              isDragOver
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/30 hover:border-muted-foreground/50"
            )}
          >
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isDragOver ? "Déposez ici" : "Ajouter des images"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all cursor-pointer",
          "flex flex-col items-center justify-center gap-2 p-6",
          isDragOver
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
        )}
      >
        <div className={cn(
          "p-3 rounded-full transition-colors",
          isDragOver ? "bg-primary/20" : "bg-muted"
        )}>
          <Upload className={cn(
            "h-6 w-6 transition-colors",
            isDragOver ? "text-primary" : "text-muted-foreground"
          )} />
        </div>

        <div className="text-center">
          <p className={cn(
            "font-medium transition-colors",
            isDragOver ? "text-primary" : "text-foreground"
          )}>
            {isDragOver ? "Déposez vos images ici" : "Glissez vos images ici"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ou cliquez pour sélectionner ({images.length}/{maxImages})
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-md border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
