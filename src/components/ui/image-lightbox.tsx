/**
 * @file image-lightbox.tsx
 * @description Composant lightbox pour afficher les images en plein écran dans une modal
 */

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface ImageLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl?: string;
  fileName?: string;
}

export function ImageLightbox({ 
  open, 
  onOpenChange, 
  imageUrl, 
  fileName 
}: ImageLightboxProps) {
  if (!imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName || "image";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none bg-transparent shadow-none [&>button]:hidden">
        <div className="relative flex flex-col items-center">
          {/* Close and download buttons */}
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={handleDownload}
              title="Télécharger"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => onOpenChange(false)}
              title="Fermer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Image */}
          <img
            src={imageUrl}
            alt={fileName || "Image en plein écran"}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
          />

          {/* File name */}
          {fileName && (
            <div className="mt-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-full">
              <span className="text-sm text-foreground">{fileName}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
