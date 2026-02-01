"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { toast } from "sonner";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface UseFormPersistenceOptions<T> {
  /** Unique key for localStorage */
  key: string;
  /** Current form data */
  formData: T;
  /** Function to update form data */
  setFormData: (data: T) => void;
  /** Whether the form has unsaved changes */
  isDirty: boolean;
  /** Auto-save interval in milliseconds (default: 5000) */
  autoSaveInterval?: number;
  /** Whether to show recovery toast (default: true) */
  showRecoveryToast?: boolean;
}

/**
 * Hook for persisting form data to localStorage with auto-save
 * Prevents data loss on screen sleep, crashes, or accidental closure
 */
export function useFormPersistence<T>({
  key,
  formData,
  setFormData,
  isDirty,
  autoSaveInterval = 5000,
  showRecoveryToast = true,
}: UseFormPersistenceOptions<T>) {
  const hasRecovered = useRef(false);
  const storageKey = `form-draft-${key}`;
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Track last saved hash to avoid redundant saves
  const lastSavedHashRef = useRef<string>("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Memoize the hash computation to avoid unnecessary recalculations
  const currentHash = useMemo(() => {
    try {
      return JSON.stringify(formData);
    } catch {
      return "";
    }
  }, [formData]);

  // Auto-save when dirty and data actually changed - with debounce
  useEffect(() => {
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // Debounce the hash comparison to avoid rapid re-triggers
    debounceTimeoutRef.current = setTimeout(() => {
      // Clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      if (!isDirty) {
        // Form is not dirty, stay idle
        if (autoSaveStatus !== "idle") {
          setAutoSaveStatus("idle");
        }
        return;
      }

      // Check if data actually changed from last save
      if (currentHash === lastSavedHashRef.current) {
        // Data hasn't changed, don't re-save
        return;
      }

      // Data changed, schedule save after interval
      saveTimeoutRef.current = setTimeout(() => {
        try {
          // Final check before saving
          if (currentHash === lastSavedHashRef.current) {
            return;
          }

          localStorage.setItem(storageKey, JSON.stringify({
            data: formData,
            timestamp: Date.now(),
          }));

          lastSavedHashRef.current = currentHash;
          console.log(`[useFormPersistence] Auto-saved: ${storageKey}`);
          setAutoSaveStatus("saved");
          setLastSavedAt(new Date());

          // Reset to idle after 3 seconds
          setTimeout(() => setAutoSaveStatus("idle"), 3000);
        } catch (e) {
          console.error(`[useFormPersistence] Failed to save:`, e);
          setAutoSaveStatus("error");
        }
      }, autoSaveInterval);
    }, 500); // 500ms debounce before checking changes

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [currentHash, isDirty, storageKey, autoSaveInterval, autoSaveStatus, formData]);

  // Recover on mount
  useEffect(() => {
    if (hasRecovered.current) return;
    if (typeof window === "undefined") return; // SSR guard

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;

      const { data, timestamp } = JSON.parse(saved);

      // Only recover if less than 24 hours old
      const ageHours = (Date.now() - timestamp) / (1000 * 60 * 60);
      if (ageHours > 24) {
        localStorage.removeItem(storageKey);
        return;
      }

      hasRecovered.current = true;
      // Store the recovered hash to avoid immediate re-save
      lastSavedHashRef.current = JSON.stringify(data);

      if (showRecoveryToast) {
        toast.info("Données récupérées", {
          description: "Vos modifications non sauvegardées ont été restaurées.",
          duration: 10000,
          action: {
            label: "Ignorer",
            onClick: () => {
              localStorage.removeItem(storageKey);
              window.location.reload();
            },
          },
        });
      }

      setFormData(data);
    } catch (e) {
      console.error(`[useFormPersistence] Failed to recover:`, e);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, setFormData, showRecoveryToast]);

  // Clear persistence after successful save
  const clearPersistence = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(storageKey);
    lastSavedHashRef.current = "";
    setAutoSaveStatus("idle");
    console.log(`[useFormPersistence] Cleared: ${storageKey}`);
  }, [storageKey]);

  // Check if there's saved data
  const hasSavedData = useCallback(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) !== null;
  }, [storageKey]);

  return { clearPersistence, hasSavedData, autoSaveStatus, lastSavedAt };
}
