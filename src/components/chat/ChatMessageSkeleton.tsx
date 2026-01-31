"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const ChatMessageSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3 items-start"
  >
    {/* Avatar skeleton */}
    <Skeleton className="h-8 w-8 rounded-full shrink-0" />

    {/* Message bubble skeleton */}
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </motion.div>
);

export const ChatOptionsSkeleton = () => (
  <div className="space-y-2 mt-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full rounded-lg" />
    ))}
  </div>
);

export const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-1 px-3 py-2"
  >
    <span className="text-xs text-muted-foreground">En train d&apos;écrire</span>
    <motion.span
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.2, repeat: Infinity }}
      className="flex gap-0.5"
    >
      <span className="w-1 h-1 bg-muted-foreground rounded-full" />
      <span className="w-1 h-1 bg-muted-foreground rounded-full" />
      <span className="w-1 h-1 bg-muted-foreground rounded-full" />
    </motion.span>
  </motion.div>
);
