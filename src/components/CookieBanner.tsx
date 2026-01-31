"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Cookie, Settings, Shield, Eye, X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

const COOKIE_CONSENT_KEY = "cookie_consent";
const VISITOR_ID_KEY = "cookie_visitor_id";

// Generate a unique visitor ID
const generateVisitorId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Get or create visitor ID
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
};

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false,
    analytics: false,
  });
  const bannerTimerRef = useRef<number | null>(null);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if consent has already been given
  useEffect(() => {
    if (!mounted) return;

    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay before showing the banner
      bannerTimerRef.current = window.setTimeout(
        () => setShowBanner(true),
        1500
      );
    } else {
      try {
        const parsed = JSON.parse(consent);
        setPreferences(parsed);
      } catch {
        // Corrupted value: clear and show banner once
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        setShowBanner(true);
      }
    }

    return () => {
      if (bannerTimerRef.current) {
        clearTimeout(bannerTimerRef.current);
      }
    };
  }, [mounted]);

  // Listen for event to open settings
  useEffect(() => {
    if (!mounted) return;

    const handleOpenSettings = () => {
      setShowSettings(true);
    };
    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () =>
      window.removeEventListener("open-cookie-settings", handleOpenSettings);
  }, [mounted]);

  // Save consent
  const saveConsent = useCallback(
    async (prefs: CookiePreferences, method: string) => {
      // Cancel any pending timer
      if (bannerTimerRef.current) {
        clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = null;
      }

      setIsLoading(true);

      // Local save
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
      setPreferences(prefs);

      // Save to database for GDPR audit
      try {
        const supabase = createClient();
        const visitorId = getVisitorId();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        await supabase.from("cookie_consents").insert({
          visitor_id: visitorId,
          user_id: user?.id || null,
          essential: prefs.essential,
          functional: prefs.functional,
          analytics: prefs.analytics,
          consent_method: method,
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        // Log error but don't block the user
        console.error("Error saving cookie consent:", error);
      }

      setIsLoading(false);
      setShowBanner(false);
      setShowSettings(false);
    },
    []
  );

  // Accept all
  const handleAcceptAll = () => {
    saveConsent(
      { essential: true, functional: true, analytics: true },
      "accept_all"
    );
  };

  // Reject all (except essential)
  const handleRejectAll = () => {
    saveConsent(
      { essential: true, functional: false, analytics: false },
      "reject_all"
    );
  };

  // Save custom preferences
  const handleSavePreferences = () => {
    saveConsent(preferences, "custom");
  };

  // Don't render until mounted
  if (!mounted) return null;

  return (
    <>
      {/* Main Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 z-50 p-4 md:p-6 pointer-events-none"
          >
            <div className="container-custom max-w-4xl">
              <div className="bg-card border border-border/30 shadow-2xl rounded-2xl p-6 md:p-8 pointer-events-auto">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground mb-2">
                      Nous respectons votre vie privée
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Nous utilisons des cookies pour améliorer votre expérience
                      sur notre site. Les cookies essentiels sont nécessaires au
                      fonctionnement du site. Vous pouvez personnaliser vos
                      préférences ou accepter l&apos;ensemble des cookies.{" "}
                      <Link
                        href="/cookies"
                        className="text-primary hover:underline"
                      >
                        En savoir plus
                      </Link>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBanner(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Tout accepter
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Personnaliser
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Refuser les optionnels
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customization Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Gérer vos préférences cookies
            </DialogTitle>
            <DialogDescription>
              Personnalisez les cookies que vous souhaitez accepter. Les cookies
              essentiels ne peuvent pas être désactivés.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Essential cookies */}
            <div className="flex items-start justify-between gap-4 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Cookies essentiels
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Indispensables au fonctionnement du site (authentification,
                    sécurité, consentement).
                  </p>
                </div>
              </div>
              <Switch
                checked
                disabled
                className="data-[state=checked]:bg-green-600"
              />
            </div>

            {/* Functional cookies */}
            <div className="flex items-start justify-between gap-4 p-4 bg-muted/30 border border-border/50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Cookies fonctionnels
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mémorisent vos préférences (thème, accessibilité) pour une
                    meilleure expérience.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, functional: checked }))
                }
              />
            </div>

            {/* Analytics cookies */}
            <div className="flex items-start justify-between gap-4 p-4 bg-muted/30 border border-border/50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Cookies analytiques
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nous aident à comprendre comment vous utilisez le site pour
                    l&apos;améliorer.
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, analytics: checked }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border/50">
            <button
              onClick={handleRejectAll}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Tout refuser
            </button>
            <button
              onClick={handleSavePreferences}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              <Check className="w-4 h-4 mr-2" />
              Enregistrer mes choix
            </button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            <Link
              href="/cookies"
              className="hover:underline"
              onClick={() => setShowSettings(false)}
            >
              Consulter notre politique de cookies complète
            </Link>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Hook to check cookie preferences in other components
export function useCookiePreferences(): CookiePreferences {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent) {
      try {
        setPreferences(JSON.parse(consent));
      } catch {
        // Fallback to defaults
      }
    }
  }, []);

  return preferences;
}
