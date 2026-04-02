"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { InscriptionButton } from "@/components/inscription/InscriptionButton";
import FormationDetailContent, { type FormationDetailData } from "./FormationDetailContent";

interface FormationDetailModalProps {
  slug: string | null;
  pole: string;
  onClose: () => void;
}

export default function FormationDetailModal({ slug, pole, onClose }: FormationDetailModalProps) {
  const [formation, setFormation] = useState<FormationDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchFormation = useCallback(async (s: string) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/formations/${s}`);
      if (!res.ok) throw new Error();
      setFormation(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug) {
      fetchFormation(slug);
      document.body.style.overflow = "hidden";
    } else {
      setFormation(null);
    }
    return () => { document.body.style.overflow = ""; };
  }, [slug, fetchFormation]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (slug) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [slug, onClose]);

  return (
    <AnimatePresence>
      {slug && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[80] flex flex-col bg-white"
        >
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Aperçu de la formation</p>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain bg-[#F5F6F8]">
            {loading && (
              <div className="flex items-center justify-center py-40">
                <Loader2 className="w-7 h-7 animate-spin text-gray-300" />
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-40 text-gray-400">
                <p className="mb-3">Impossible de charger cette formation.</p>
                <button onClick={onClose} className="text-sm underline">Retour</button>
              </div>
            )}

            {formation && !loading && (
              <FormationDetailContent
                formation={formation}
                showBanner={true}
                titleAs="h1"
              />
            )}
          </div>

          {/* Mobile CTA sticky bottom */}
          {formation && !loading && (
            <div className="lg:hidden sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
              <InscriptionButton
                formation={{ id: formation.id, title: formation.title, price: formation.price_ht ? `${formation.price_ht}€ HT` : undefined }}
                size="sm"
                fullWidth={false}
                className="flex-1"
              />
              <InscriptionButton
                formation={{ id: formation.id, title: formation.title, price: formation.price_ht ? `${formation.price_ht}€ HT` : undefined }}
                mode="devis"
                variant="secondary"
                size="sm"
                fullWidth={false}
                className="flex-1"
                label="Devis"
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
