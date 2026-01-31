"use client";

/**
 * @file PasswordStrengthIndicator.tsx
 * @description Composant pour afficher les critères de force du mot de passe
 * Inclut la vérification Have I Been Pwned pour détecter les mots de passe compromis
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface PasswordCheck {
  label: string;
  valid: boolean;
  loading?: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  showMatchCheck?: boolean;
  confirmPassword?: string;
  onPwnedStatusChange?: (isPwned: boolean, isChecking: boolean) => void;
}

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: "8 caractères", valid: password.length >= 8 },
    { label: "Majuscule", valid: /[A-Z]/.test(password) },
    { label: "Minuscule", valid: /[a-z]/.test(password) },
    { label: "Chiffre", valid: /[0-9]/.test(password) },
  ];
}

export function isPasswordValid(password: string): boolean {
  const checks = getPasswordChecks(password);
  return checks.every((check) => check.valid);
}

/**
 * Vérifie si un mot de passe est présent dans la base Have I Been Pwned
 * Utilise k-anonymity : seuls les 5 premiers caractères du hash SHA-1 sont envoyés
 */
async function checkPwnedPassword(password: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();

    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: { "Add-Padding": "true" },
      }
    );

    if (!response.ok) {
      console.warn("HIBP API error:", response.status);
      return false;
    }

    const text = await response.text();
    return text.includes(suffix);
  } catch (err) {
    console.warn("HIBP check failed:", err);
    return false;
  }
}

export function PasswordStrengthIndicator({
  password,
  showMatchCheck = false,
  confirmPassword = "",
  onPwnedStatusChange,
}: PasswordStrengthIndicatorProps) {
  const [isPwned, setIsPwned] = useState(false);
  const [isCheckingPwned, setIsCheckingPwned] = useState(false);

  const checks = getPasswordChecks(password);
  const basicChecksValid = checks.every((check) => check.valid);

  useEffect(() => {
    if (!basicChecksValid || password.length < 8) {
      setIsPwned(false);
      setIsCheckingPwned(false);
      onPwnedStatusChange?.(false, false);
      return;
    }

    setIsCheckingPwned(true);
    onPwnedStatusChange?.(isPwned, true);

    const timeoutId = setTimeout(async () => {
      const pwned = await checkPwnedPassword(password);
      setIsPwned(pwned);
      setIsCheckingPwned(false);
      onPwnedStatusChange?.(pwned, false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [password, basicChecksValid, isPwned, onPwnedStatusChange]);

  const allChecks: PasswordCheck[] = [...checks];

  if (basicChecksValid) {
    allChecks.push({
      label: "Non compromis",
      valid: !isPwned && !isCheckingPwned,
      loading: isCheckingPwned,
    });
  }

  if (showMatchCheck && confirmPassword) {
    allChecks.push({
      label: "Mots de passe identiques",
      valid: password === confirmPassword && password.length > 0,
    });
  }

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-3 flex flex-wrap gap-2"
    >
      {allChecks.map((check, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
            check.loading
              ? "bg-muted text-muted-foreground"
              : check.valid
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {check.loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : check.valid ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {check.label}
        </span>
      ))}
    </motion.div>
  );
}
