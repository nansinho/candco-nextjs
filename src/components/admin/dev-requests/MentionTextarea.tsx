"use client";

/**
 * @file MentionTextarea.tsx
 * @description Textarea avec support des @mentions pour les commentaires
 */

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  users: User[];
  className?: string;
  disabled?: boolean;
}

export function MentionTextarea({
  value,
  onChange,
  placeholder,
  users,
  className,
  disabled,
}: MentionTextareaProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter users based on query
  const filteredUsers = users.filter((user) => {
    if (!suggestionQuery) return true;
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    return fullName.includes(suggestionQuery.toLowerCase());
  }).slice(0, 5); // Limit to 5 suggestions

  // Detect @ typing
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const position = e.target.selectionStart || 0;
      setCursorPosition(position);

      // Check if we're typing after an @
      const textBeforeCursor = newValue.slice(0, position);
      const atMatch = textBeforeCursor.match(/@(\w*)$/);

      if (atMatch) {
        setSuggestionQuery(atMatch[1]);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
        setSuggestionQuery("");
      }

      onChange(newValue);
    },
    [onChange]
  );

  // Insert mention
  const insertMention = useCallback(
    (user: User) => {
      const textBeforeCursor = value.slice(0, cursorPosition);
      const textAfterCursor = value.slice(cursorPosition);

      // Find the @ position
      const atMatch = textBeforeCursor.match(/@(\w*)$/);
      if (!atMatch) return;

      const atPosition = textBeforeCursor.lastIndexOf("@");
      const beforeAt = value.slice(0, atPosition);
      const mentionName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      const newValue = `${beforeAt}@${mentionName} ${textAfterCursor}`;

      onChange(newValue);
      setShowSuggestions(false);
      setSuggestionQuery("");

      // Focus back on textarea
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = beforeAt.length + mentionName.length + 2; // +2 for @ and space
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    },
    [value, cursorPosition, onChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || filteredUsers.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        break;
      case "Enter":
        if (showSuggestions) {
          e.preventDefault();
          insertMention(filteredUsers[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
      case "Tab":
        if (showSuggestions) {
          e.preventDefault();
          insertMention(filteredUsers[selectedIndex]);
        }
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("min-h-[80px] resize-none", className)}
        disabled={disabled}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && filteredUsers.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border rounded-md shadow-lg overflow-hidden"
        >
          <div className="py-1">
            {filteredUsers.map((user, index) => {
              const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Utilisateur";
              const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "??";

              return (
                <button
                  key={user.id}
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                  onClick={() => insertMention(user)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span>{fullName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Parse comment content and highlight mentions
 */
export function parseCommentWithMentions(content: string): React.ReactNode {
  // Match @FirstName LastName pattern
  const mentionRegex = /@([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    // Add the mention with styling
    parts.push(
      <span
        key={match.index}
        className="font-semibold text-primary bg-primary/10 px-1 rounded"
      >
        {match[0]}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}
