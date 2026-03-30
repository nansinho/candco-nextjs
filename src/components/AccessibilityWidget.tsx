"use client";

import { useState, useEffect, forwardRef, SVGProps } from "react";
import { X, Type, Eye, Link2, Contrast, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MotionButton = motion.button;
const MotionDiv = motion.div;

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
        <circle cx="12" cy="4" r="2.5" />
        <line x1="12" y1="6.5" x2="12" y2="14" />
        <line x1="5" y1="9" x2="19" y2="9" />
        <line x1="12" y1="14" x2="7" y2="22" />
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

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const applySettings = (newSettings: AccessibilitySettings) => {
    const html = document.documentElement;
    html.classList.toggle("accessibility-large-text", newSettings.largeText);
    html.classList.toggle("accessibility-high-contrast", newSettings.highContrast);
    html.classList.toggle("accessibility-wide-spacing", newSettings.wideSpacing);
    html.classList.toggle("accessibility-highlight-links", newSettings.highlightLinks);
    html.classList.toggle("accessibility-desaturated", newSettings.desaturated);
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("accessibility-settings", JSON.stringify(newSettings));
    applySettings(newSettings);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("accessibility-settings");
    applySettings(defaultSettings);
  };

  const hasActiveSettings = Object.values(settings).some(Boolean);

  const options = [
    { key: "largeText" as const, label: "Texte agrandi", description: "Augmente la taille du texte", icon: Type },
    { key: "highContrast" as const, label: "Contraste élevé", description: "Améliore le contraste des couleurs", icon: Contrast },
    { key: "wideSpacing" as const, label: "Espacement large", description: "Augmente l'espacement du texte", icon: Type },
    { key: "highlightLinks" as const, label: "Surligner les liens", description: "Rend les liens plus visibles", icon: Link2 },
    { key: "desaturated" as const, label: "Mode désaturé", description: "Affichage en niveaux de gris", icon: Eye },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* Toggle Button */}
      <MotionButton
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-300"
        style={{ backgroundColor: "#1F628E", color: "#fff" }}
        aria-label="Ouvrir les options d'accessibilité"
        aria-expanded={isOpen}
      >
        <AccessibilityIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        {hasActiveSettings && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F8A991] ring-2 ring-[#1F628E]" />
        )}
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
              className="fixed inset-0 z-50"
              style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              aria-hidden="true"
            />

            {/* Panel */}
            <MotionDiv
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-title"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-6 left-6 z-50 w-[340px] max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl overflow-hidden"
              style={{ backgroundColor: "#1a2332", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "#1F628E" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                    <AccessibilityIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 id="accessibility-title" className="font-semibold text-white text-[15px]">
                      Accessibilité
                    </h2>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                      Personnalisez votre expérience
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Options */}
              <div className="p-4 space-y-2">
                {options.map((option) => {
                  const isActive = settings[option.key];
                  return (
                    <button
                      key={option.key}
                      onClick={() => updateSetting(option.key, !isActive)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                      style={{
                        backgroundColor: isActive ? "rgba(31,98,142,0.2)" : "rgba(255,255,255,0.04)",
                        border: isActive ? "1px solid rgba(31,98,142,0.4)" : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: isActive ? "#1F628E" : "rgba(255,255,255,0.06)",
                        }}
                      >
                        <option.icon className="w-4 h-4" style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.5)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.8)" }}>
                          {option.label}
                        </p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {option.description}
                        </p>
                      </div>
                      <div
                        className="w-10 h-6 rounded-full relative shrink-0 transition-colors"
                        style={{ backgroundColor: isActive ? "#1F628E" : "rgba(255,255,255,0.1)" }}
                      >
                        <div
                          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                          style={{ left: isActive ? "22px" : "4px" }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              {hasActiveSettings && (
                <div className="px-4 pb-4">
                  <button
                    onClick={resetSettings}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-colors"
                    style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Réinitialiser
                  </button>
                </div>
              )}
            </MotionDiv>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
