"use client";

/**
 * @file MessageInput.tsx
 * @description Zone de saisie avec emoji picker pour les messages
 * Optimisé pour mobile avec gestion du clavier virtuel
 * @module Messaging/MessageInput
 */

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { EmojiPicker } from "./EmojiPicker";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
  sending = false,
  placeholder = "Écrivez votre message...",
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSend();
    }
  };

  // Gérer l'envoi avec Entrée (sans Shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !sending) {
        onSend();
      }
    }
  };

  // Auto-resize du textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px (environ 4 lignes)
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  return (
    <div className="p-3 border-t border-border/30 bg-card safe-area-bottom">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <EmojiPicker
          onEmojiSelect={(emoji) => onChange(value + emoji)}
          disabled={disabled || sending}
        />
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          className={cn(
            "min-h-[40px] max-h-[120px] py-2 px-3 resize-none",
            "border-0 bg-secondary/30 focus-visible:ring-1",
            "text-sm leading-relaxed"
          )}
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || sending || !value.trim()}
          className="h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
