"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Target, Wrench, UserCheck } from "lucide-react";

const items = [
  {
    icon: Target,
    title: "Mises en situation réelles",
    desc: "Des exercices terrain, des simulations grandeur nature et des cas concrets issus du monde professionnel.",
    defaultOpen: true,
  },
  {
    icon: Wrench,
    title: "Équipements professionnels",
    desc: "Formez-vous sur du matériel identique à celui utilisé en entreprise : mannequins, extincteurs, défibrillateurs.",
  },
  {
    icon: UserCheck,
    title: "Suivi individualisé",
    desc: "Chaque stagiaire bénéficie d'un accompagnement personnalisé pour garantir une montée en compétences durable.",
  },
];

export default function FeatureHighlightV2() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-20 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image side */}
          <div className="relative order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden shadow-md">
              <div className="relative aspect-[4/3]">
                <Image src="/images/poles/pole-health.jpg" alt="Formation pratique" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>
            {/* Floating stat */}
            <div className="absolute -bottom-4 -right-4 sm:bottom-6 sm:-right-6 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <p className="text-3xl font-extrabold text-[#1F628E]">15+</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Années d&apos;expérience</p>
            </div>
          </div>

          {/* Text side */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-[#151F2D] leading-[1.15] mb-4">
              Des formations <span style={{ color: "#1F628E" }}>concrètes et pratiques</span>
            </h2>
            <p className="text-base text-gray-500 mb-8 leading-relaxed">
              Chez C&Co, chaque formation est pensée pour être directement applicable. Nos méthodes pédagogiques combinent théorie et pratique.
            </p>

            <div className="space-y-3">
              {items.map((item, i) => {
                const Icon = item.icon;
                const isOpen = open === i;
                return (
                  <div
                    key={item.title}
                    className={`rounded-xl border transition-all duration-200 ${
                      isOpen ? "border-[#1F628E]/20 bg-[#1F628E]/[0.03] shadow-sm" : "border-gray-200 bg-white"
                    }`}
                  >
                    <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setOpen(i)}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? "bg-[#1F628E] text-white" : "bg-gray-100 text-gray-400"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`flex-1 font-semibold text-[15px] transition-colors ${
                        isOpen ? "text-[#1F628E]" : "text-[#151F2D]"
                      }`}>
                        {item.title}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-40" : "max-h-0"}`}>
                      <p className="px-4 pb-4 pl-16 text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
