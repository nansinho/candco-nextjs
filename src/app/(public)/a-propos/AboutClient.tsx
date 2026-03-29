"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, CheckCircle, FileCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AboutClient() {
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  const certificatePages = [
    "/documents/certificat-qualiopi-page1.jpg",
    "/documents/certificat-qualiopi-page2.jpg",
  ];

  return (
    <>
      {/* Certification Qualiopi */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>
              Notre certification
            </span>
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white mb-4">
              Certification Qualiopi : gage de <span style={{ color: "#F8A991" }}>qualité</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              Une certification qui garantit l&apos;excellence de nos processus de formation.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl p-8 sm:p-10" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Header with logo */}
              <div className="flex flex-col md:flex-row gap-8 items-center mb-10">
                <div className="shrink-0 p-5 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="relative h-16" style={{ aspectRatio: "128/64" }}>
                    <Image src="/logo-qualiopi.png" alt="Certification Qualiopi" fill className="object-contain" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-normal text-white mb-2">Certificat N° 3279 OF</h3>
                  <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Délivré par <span className="text-white font-bold">QUALIANOR Certification</span> pour la réalisation d&apos;<span className="text-white font-bold">actions de formation</span>
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <div className="flex items-center gap-4 p-5 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(248,169,145,0.1)" }}>
                    <FileCheck className="w-5 h-5" style={{ color: "#F8A991" }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Certifié depuis</p>
                    <p className="text-[15px] font-bold text-white">24 novembre 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(31,98,142,0.15)" }}>
                    <CheckCircle className="w-5 h-5" style={{ color: "#1F628E" }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Valable jusqu&apos;au</p>
                    <p className="text-[15px] font-bold text-white">23 novembre 2027</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4 mb-10">
                <p className="text-[14px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Grâce à notre <span className="text-white font-bold">certification Qualiopi « action de formation »</span>, nous garantissons des formations de qualité, conçues sur mesure pour répondre à vos besoins spécifiques.
                </p>
                <p className="text-[14px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Nos programmes s&apos;appuient sur des <span className="text-white font-bold">méthodes pédagogiques innovantes</span>, notamment la simulation immersive, qui permettent une acquisition rapide et efficace des compétences.
                </p>
                <p className="text-[14px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  En choisissant C&Co Formation, vous bénéficiez d&apos;un <span className="text-white font-bold">accompagnement personnalisé tout au long de votre parcours</span>, assuré par des formateurs expérimentés et passionnés.
                </p>
              </div>

              {/* Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsCertificateOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[15px] transition-all duration-300 hover:scale-[1.02]"
                  style={{ backgroundColor: "#F8A991", color: "#151F2D", boxShadow: "0 0 30px rgba(248,169,145,0.15)" }}
                >
                  <Eye className="w-4 h-4" /> Voir le certificat
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <Dialog open={isCertificateOpen} onOpenChange={setIsCertificateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-4 pb-2 shrink-0 border-b border-border/30">
            <DialogTitle className="flex items-center gap-3">
              <div className="relative h-8" style={{ aspectRatio: "64/32" }}>
                <Image src="/logo-qualiopi.png" alt="Qualiopi" fill className="object-contain" />
              </div>
              Certificat Qualiopi N° 3279 OF
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4 space-y-6" onContextMenu={(e) => e.preventDefault()}>
            {certificatePages.map((page, index) => (
              <div key={index} className="relative">
                <img src={page} alt={`Certificat Qualiopi - Page ${index + 1}`} className="w-full h-auto rounded-lg border border-border/30 shadow-sm select-none pointer-events-none" draggable={false} onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()} />
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden rounded-lg">
                  <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                    <div className="flex flex-col items-center gap-16">
                      {Array.from({ length: 6 }).map((_, rowIndex) => (
                        <div key={rowIndex} className="flex gap-10">
                          {Array.from({ length: 5 }).map((_, colIndex) => (
                            <span key={colIndex} className="text-xl md:text-2xl font-light tracking-widest text-primary/[0.13] whitespace-nowrap uppercase">C&Co Formation</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
