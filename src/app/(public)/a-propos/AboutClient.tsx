"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, CheckCircle, FileCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      {/* Certification Qualiopi Section */}
      <section className="section-padding border-b border-border/50 bg-muted/30">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
                Notre certification
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-8">
                Certification Qualiopi : gage de qualité.
              </h2>
            </div>

            <div className="bg-background rounded-2xl border border-border/50 p-8 md:p-10 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                <div className="shrink-0">
                  <Image
                    src="/logo-qualiopi.png"
                    alt="Certification Qualiopi"
                    width={160}
                    height={80}
                    className="h-20 w-auto"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-medium mb-2">
                    Certificat N° 3279 OF
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Délivré par{" "}
                    <strong className="text-foreground">
                      QUALIANOR Certification
                    </strong>{" "}
                    pour la réalisation d'
                    <strong className="text-foreground">
                      actions de formation
                    </strong>
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <FileCheck className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Organisme certifié depuis
                    </p>
                    <p className="font-medium">24 novembre 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Certificat valable jusqu'au
                    </p>
                    <p className="font-medium">23 novembre 2027</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-muted-foreground leading-relaxed">
                  Grâce à notre{" "}
                  <strong className="text-foreground">
                    certification Qualiopi « action de formation »
                  </strong>
                  , nous garantissons des formations de qualité, conçues sur
                  mesure pour répondre à vos besoins spécifiques.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Nos programmes s'appuient sur des{" "}
                  <strong className="text-foreground">
                    méthodes pédagogiques innovantes
                  </strong>
                  , notamment la simulation immersive, qui permettent une
                  acquisition rapide et efficace des compétences.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  En choisissant C&Co Formation, vous bénéficiez d'un{" "}
                  <strong className="text-foreground">
                    accompagnement personnalisé tout au long de votre parcours
                  </strong>
                  , assuré par des formateurs expérimentés et passionnés.
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="default"
                  className="gap-2"
                  onClick={() => setIsCertificateOpen(true)}
                >
                  <Eye className="w-4 h-4" />
                  Voir le certificat
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Certificat Qualiopi */}
      <Dialog open={isCertificateOpen} onOpenChange={setIsCertificateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-4 pb-2 shrink-0 border-b border-border/30">
            <DialogTitle className="flex items-center gap-3">
              <Image
                src="/logo-qualiopi.png"
                alt="Qualiopi"
                width={64}
                height={32}
                className="h-8 w-auto"
              />
              Certificat Qualiopi N° 3279 OF
            </DialogTitle>
          </DialogHeader>

          <div
            className="flex-1 overflow-auto p-4 space-y-6"
            onContextMenu={(e) => e.preventDefault()}
          >
            {certificatePages.map((page, index) => (
              <div key={index} className="relative">
                <img
                  src={page}
                  alt={`Certificat Qualiopi - Page ${index + 1}`}
                  className="w-full h-auto rounded-lg border border-border/30 shadow-sm select-none pointer-events-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                />
                {/* Watermark protection */}
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden rounded-lg">
                  <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                    <div className="flex flex-col items-center gap-16">
                      {Array.from({ length: 6 }).map((_, rowIndex) => (
                        <div key={rowIndex} className="flex gap-10">
                          {Array.from({ length: 5 }).map((_, colIndex) => (
                            <span
                              key={colIndex}
                              className="text-xl md:text-2xl font-light tracking-widest text-primary/[0.13] whitespace-nowrap uppercase"
                            >
                              C&Co Formation
                            </span>
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
