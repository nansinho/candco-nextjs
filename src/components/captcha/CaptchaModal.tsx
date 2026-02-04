"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CaptchaIconGrid } from "./CaptchaIconGrid";
import type { CaptchaModalProps } from "./types";
import { cn } from "@/lib/utils";

export function CaptchaModal({
  open,
  onOpenChange,
  step,
  challenge,
  onIconClick,
  onRefresh,
  isShaking,
}: CaptchaModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Vérification de sécurité
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mr-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                step >= 1 ? "bg-primary" : "bg-muted"
              )}
            />
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                step >= 2 ? "bg-primary" : "bg-muted"
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Étape {step} sur 2
          </p>
        </DialogHeader>

        {/* Challenge */}
        <div className="p-4 sm:p-6">
          {/* Instruction */}
          <div className="flex items-center justify-between mb-4 p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm">
                Cliquez sur :{" "}
                <span className="font-semibold text-primary">
                  {challenge.word}
                </span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRefresh}
              title="Nouveau challenge"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Icon Grid with shake animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${step}-${challenge.word}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: isShaking ? [0, -10, 10, -10, 10, 0] : 0,
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: isShaking ? 0.4 : 0.2,
                x: { duration: 0.4 },
              }}
            >
              <CaptchaIconGrid icons={challenge.icons} onIconClick={onIconClick} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 pt-2 border-t border-border/50 bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">
            Vérification de sécurité C&Co Formation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
