"use client";

import { useState, useEffect, forwardRef, SVGProps } from "react";
import { X, Type, Eye, Link2, Contrast } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Create motion components that support refs
const MotionButton = motion.button;
const MotionDiv = motion.div;

// Custom accessibility icon - person with arms and legs spread (universal design symbol)
const AccessibilityIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  function AccessibilityIcon({ className, ...props }, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {/* Head */}
        <circle cx="12" cy="4" r="2.5" />
        {/* Body */}
        <line x1="12" y1="6.5" x2="12" y2="14" />
        {/* Arms spread */}
        <line x1="5" y1="9" x2="19" y2="9" />
        {/* Left leg */}
        <line x1="12" y1="14" x2="7" y2="22" />
        {/* Right leg */}
        <line x1="12" y1="14" x2="17" y2="22" />
      </svg>
    );
  }
);

AccessibilityIcon.displayName = "AccessibilityIcon";

interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  wideSpacing: boolean;
  highlightLinks: boolean;
  desaturated: boolean;
}

const defaultSettings: AccessibilitySettings = {
  largeText: false,
  highContrast: false,
  wideSpacing: false,
  highlightLinks: false,
  desaturated: false,
};

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering (for hydration)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (!mounted) return;

    const saved = localStorage.getItem("accessibility-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        applySettings(parsed);
      } catch (e) {
        console.error("Error parsing accessibility settings:", e);
      }
    }
  }, [mounted]);

  // Apply settings to document
  const applySettings = (newSettings: AccessibilitySettings) => {
    const html = document.documentElement;

    html.classList.toggle("accessibility-large-text", newSettings.largeText);
    html.classList.toggle("accessibility-high-contrast", newSettings.highContrast);
    html.classList.toggle("accessibility-wide-spacing", newSettings.wideSpacing);
    html.classList.toggle("accessibility-highlight-links", newSettings.highlightLinks);
    html.classList.toggle("accessibility-desaturated", newSettings.desaturated);
  };

  // Update a single setting
  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("accessibility-settings", JSON.stringify(newSettings));
    applySettings(newSettings);
  };

  // Reset all settings
  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("accessibility-settings");
    applySettings(defaultSettings);
  };

  const options = [
    {
      key: "largeText" as const,
      label: "Texte agrandi",
      description: "Augmente la taille du texte",
      icon: Type,
    },
    {
      key: "highContrast" as const,
      label: "Contraste élevé",
      description: "Améliore le contraste des couleurs",
      icon: Contrast,
    },
    {
      key: "wideSpacing" as const,
      label: "Espacement large",
      description: "Augmente l'espacement du texte",
      icon: Type,
    },
    {
      key: "highlightLinks" as const,
      label: "Surligner les liens",
      description: "Rend les liens plus visibles",
      icon: Link2,
    },
    {
      key: "desaturated" as const,
      label: "Mode désaturé",
      description: "Affichage en niveaux de gris",
      icon: Eye,
    },
  ];

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) return null;

  return (
    <>
      {/* Toggle Button - Fixed bottom left */}
      <MotionButton
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group"
        aria-label="Ouvrir les options d'accessibilité"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        <AccessibilityIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
      </MotionButton>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              aria-hidden="true"
            />

            {/* Panel */}
            <MotionDiv
              id="accessibility-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-title"
              initial={{ opacity: 0, x: -100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed bottom-6 left-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] max-h-[80vh] bg-card border border-border/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-primary/10 px-5 py-4 flex items-center justify-between border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <AccessibilityIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 id="accessibility-title" className="font-semibold text-foreground">
                      Accessibilité
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Personnalisez votre expérience
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Fermer le panneau d'accessibilité"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Options */}
              <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
                {options.map((option) => (
                  <div
                    key={option.key}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-background rounded-lg flex items-center justify-center">
                        <option.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <Label
                          htmlFor={option.key}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {option.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={option.key}
                      checked={settings[option.key]}
                      onCheckedChange={(checked) => updateSetting(option.key, checked)}
                      aria-describedby={`${option.key}-desc`}
                    />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 pb-4">
                <button
                  onClick={resetSettings}
                  className="w-full py-2 px-4 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                  aria-label="Réinitialiser tous les paramètres d'accessibilité"
                >
                  Réinitialiser les paramètres
                </button>
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
