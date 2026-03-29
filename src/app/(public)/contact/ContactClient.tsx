"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Phone, Mail, Clock, CheckCircle, ArrowRight, Send,
  User, Building2, MessageSquare, Sparkles, FileText, Shield,
} from "lucide-react";
import { IconCaptcha } from "@/components/captcha";
import CTASectionV2 from "@/components/home/v2/CTASectionV2";

/* ── Borderless glass input ── */
function GlassInput({
  icon: Icon, label, id, type = "text", required = false,
  placeholder, value, onChange, onFocus, onBlur, isFocused,
}: {
  icon: React.ElementType; label: string; id: string;
  type?: string; required?: boolean; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void; onBlur: () => void; isFocused: boolean;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-[12px] font-bold uppercase tracking-wider mb-2.5" style={{ color: isFocused ? "#F8A991" : "rgba(255,255,255,0.4)", transition: "color 0.3s ease" }}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none transition-all duration-300" style={{ color: isFocused ? "#F8A991" : "rgba(255,255,255,0.2)" }}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <input
          type={type} id={id} name={id} required={required}
          value={value} onChange={onChange}
          onFocus={onFocus} onBlur={onBlur}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 rounded-xl text-[15px] text-white placeholder:text-white/20 outline-none transition-all duration-300 border-none"
          style={{
            backgroundColor: isFocused ? "rgba(248,169,145,0.06)" : "rgba(255,255,255,0.04)",
            boxShadow: isFocused ? "0 0 0 1px rgba(248,169,145,0.25), 0 0 30px rgba(248,169,145,0.06)" : "none",
          }}
        />
        {/* Animated gradient line */}
        <div
          className="absolute bottom-0 left-1/2 h-[2px] rounded-full transition-all duration-500 ease-out"
          style={{ width: isFocused ? "85%" : "0%", transform: "translateX(-50%)", background: "linear-gradient(90deg, transparent, #F8A991, transparent)" }}
        />
      </div>
    </div>
  );
}

export function ContactClient() {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    company: "", subject: "", message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const focus = (f: string) => setFocused(f);
  const blur = () => setFocused(null);

  if (isSubmitted) {
    return (
      <section className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-10 animate-[pulse_3s_ease-in-out_infinite]" style={{ backgroundColor: "rgba(248,169,145,0.1)", boxShadow: "0 0 80px rgba(248,169,145,0.15)" }}>
            <CheckCircle className="w-14 h-14" style={{ color: "#F8A991" }} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-5">Message <span style={{ color: "#F8A991" }}>envoyé !</span></h1>
          <p className="text-lg leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>Merci pour votre message. Notre équipe vous répondra sous 24 h ouvrées.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-[15px] transition-all duration-300 hover:scale-[1.03]" style={{ backgroundColor: "#F8A991", color: "#151F2D", boxShadow: "0 0 40px rgba(248,169,145,0.25)" }}>
            Retour à l&apos;accueil <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* ═══ 1. HERO — full-width photo background ═══ */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center">
        {/* Background image + overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ animation: "heroSlide1 12s ease-in-out infinite" }}>
            <Image src="/images/fonds_sections/fond_contact.jpg" alt="" fill sizes="100vw" className="object-cover object-center" priority />
          </div>
          <div className="absolute inset-0" style={{ animation: "heroSlide2 12s ease-in-out infinite" }}>
            <Image src="/images/fonds_sections/fond_contact_2.jpg" alt="" fill sizes="100vw" className="object-cover object-center" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(26,111,170,0.88) 0%, rgba(31,98,142,0.9) 50%, rgba(23,86,125,0.93) 100%)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-20 sm:pb-28 text-center">
          <nav className="flex items-center justify-center gap-2 text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">Contact</span>
          </nav>
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>Contact</span>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-white max-w-3xl mx-auto mb-6">Parlons de votre <span style={{ color: "#F8A991" }}>projet</span></h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: "rgba(255,255,255,0.6)" }}>
            Notre équipe est à votre disposition pour répondre à toutes vos questions et vous accompagner dans votre parcours de formation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#formulaire" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[15px] transition-all duration-300 shadow-lg hover:scale-[1.02]" style={{ backgroundColor: "#F8A991", color: "#151F2D" }}>
              <Send className="w-4 h-4" /> Envoyer un message
            </a>
            <a href="tel:+33762596653" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[15px] text-white transition-all duration-300 hover:bg-white/10" style={{ border: "2px solid rgba(255,255,255,0.2)" }}>
              <Phone className="w-4 h-4" /> 07 62 59 66 53
            </a>
          </div>
        </div>
      </section>

      {/* ═══ 2. FORMULAIRE ═══ */}
      <section id="formulaire" className="relative py-20 sm:py-28 overflow-hidden" style={{ backgroundColor: "#151F2D" }}>
        {/* Ambient */}
        <div className="absolute top-20 right-[10%] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(248,169,145,0.05) 0%, transparent 60%)" }} />
        <div className="absolute bottom-20 left-[5%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(31,98,142,0.07) 0%, transparent 60%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>
              <Sparkles className="w-4 h-4" /> Formulaire de contact
            </span>
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white mb-5">Envoyez-nous un <span style={{ color: "#F8A991" }}>message</span></h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>Remplissez le formulaire et notre équipe vous répondra sous 24 h ouvrées.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
            {/* ── Coordonnées ── */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl p-7 space-y-7 backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  { icon: MapPin, label: "Adresse", value: "340 chemin du plan marseillais\n13320 Bouc-bel-air", color: "#F8A991" },
                  { icon: Phone, label: "Téléphone", value: "07 62 59 66 53", href: "tel:+33762596653", color: "#3498db" },
                  { icon: Mail, label: "Email", value: "contact@candco.fr", href: "mailto:contact@candco.fr", color: "#1abc9c" },
                  { icon: Clock, label: "Horaires", value: "Lun — Ven : 9h — 18h\nRéponse rapide", color: "#F8A991" },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-4 group">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                        <Icon className="w-[18px] h-[18px]" style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>{item.label}</p>
                        <p className="text-[13px] text-white/90 leading-relaxed whitespace-pre-line">{item.value}</p>
                      </div>
                    </div>
                  );
                  return (
                    <div key={item.label}>
                      {item.href ? <a href={item.href} className="block hover:translate-x-1 transition-transform duration-300">{content}</a> : content}
                      {idx < 3 && <div className="mt-7 h-px" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))" }} />}
                    </div>
                  );
                })}
              </div>

              {/* Photo supprimée — images dans le hero uniquement */}

              <div className="grid grid-cols-2 gap-4 hidden lg:grid">
                {[
                  { value: "24h", label: "Délai réponse", color: "#F8A991" },
                  { value: "98%", label: "Satisfaction", color: "#3498db" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-5 text-center" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-2xl font-extrabold mb-1" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Formulaire ── */}
            <div className="lg:col-span-8">
              <div
                className="rounded-[20px] p-px"
                style={{
                  background: focused
                    ? "linear-gradient(135deg, rgba(248,169,145,0.2), rgba(31,98,142,0.15), rgba(248,169,145,0.1))"
                    : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02), rgba(255,255,255,0.06))",
                  transition: "background 0.5s ease",
                }}
              >
                <form
                  onSubmit={handleSubmit}
                  className="rounded-[19px] p-7 sm:p-10 backdrop-blur-xl"
                  style={{ backgroundColor: "rgba(21,31,45,0.85)", boxShadow: "0 25px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)" }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-8 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(248,169,145,0.1)" }}>
                      <MessageSquare className="w-5 h-5" style={{ color: "#F8A991" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Nouveau message</p>
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Tous les champs marqués * sont obligatoires</p>
                    </div>
                  </div>

                  <div className="space-y-7">
                    {/* Identité */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style={{ color: "rgba(255,255,255,0.2)" }}>Identité</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <GlassInput icon={User} label="Prénom *" id="firstName" required placeholder="Votre prénom" value={formData.firstName} onChange={handleChange as any} onFocus={() => focus("firstName")} onBlur={blur} isFocused={focused === "firstName"} />
                        <GlassInput icon={User} label="Nom *" id="lastName" required placeholder="Votre nom" value={formData.lastName} onChange={handleChange as any} onFocus={() => focus("lastName")} onBlur={blur} isFocused={focused === "lastName"} />
                      </div>
                    </div>

                    {/* Contact */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style={{ color: "rgba(255,255,255,0.2)" }}>Contact</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <GlassInput icon={Mail} label="Email *" id="email" type="email" required placeholder="votre@email.com" value={formData.email} onChange={handleChange as any} onFocus={() => focus("email")} onBlur={blur} isFocused={focused === "email"} />
                        <GlassInput icon={Phone} label="Téléphone" id="phone" type="tel" placeholder="06 00 00 00 00" value={formData.phone} onChange={handleChange as any} onFocus={() => focus("phone")} onBlur={blur} isFocused={focused === "phone"} />
                      </div>
                    </div>

                    {/* Projet */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5" style={{ color: "rgba(255,255,255,0.2)" }}>Votre projet</p>
                      <div className="space-y-5">
                        <GlassInput icon={Building2} label="Entreprise" id="company" placeholder="Nom de votre entreprise" value={formData.company} onChange={handleChange as any} onFocus={() => focus("company")} onBlur={blur} isFocused={focused === "company"} />

                        {/* Select */}
                        <div>
                          <label htmlFor="subject" className="block text-[12px] font-bold uppercase tracking-wider mb-2.5" style={{ color: focused === "subject" ? "#F8A991" : "rgba(255,255,255,0.4)", transition: "color 0.3s ease" }}>Sujet *</label>
                          <div className="relative">
                            <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none transition-all duration-300" style={{ color: focused === "subject" ? "#F8A991" : "rgba(255,255,255,0.2)" }}>
                              <FileText className="w-[18px] h-[18px]" />
                            </div>
                            <select
                              id="subject" name="subject" required
                              value={formData.subject} onChange={handleChange}
                              onFocus={() => focus("subject")} onBlur={blur}
                              className="w-full pl-12 pr-10 py-4 rounded-xl text-[15px] outline-none transition-all duration-300 appearance-none cursor-pointer border-none"
                              style={{
                                color: formData.subject ? "#fff" : "rgba(255,255,255,0.2)",
                                backgroundColor: focused === "subject" ? "rgba(248,169,145,0.06)" : "rgba(255,255,255,0.04)",
                                boxShadow: focused === "subject" ? "0 0 0 1px rgba(248,169,145,0.25), 0 0 30px rgba(248,169,145,0.06)" : "none",
                              }}
                            >
                              <option value="" style={{ backgroundColor: "#1a2535", color: "rgba(255,255,255,0.4)" }}>Sélectionnez un sujet</option>
                              <option value="information" style={{ backgroundColor: "#1a2535", color: "#fff" }}>Demande d&apos;information</option>
                              <option value="devis" style={{ backgroundColor: "#1a2535", color: "#fff" }}>Demande de devis</option>
                              <option value="inscription" style={{ backgroundColor: "#1a2535", color: "#fff" }}>Inscription à une formation</option>
                              <option value="partenariat" style={{ backgroundColor: "#1a2535", color: "#fff" }}>Partenariat</option>
                              <option value="autre" style={{ backgroundColor: "#1a2535", color: "#fff" }}>Autre</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.2)" }}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            <div className="absolute bottom-0 left-1/2 h-[2px] rounded-full transition-all duration-500 ease-out" style={{ width: focused === "subject" ? "85%" : "0%", transform: "translateX(-50%)", background: "linear-gradient(90deg, transparent, #F8A991, transparent)" }} />
                          </div>
                        </div>

                        {/* Textarea */}
                        <div>
                          <label htmlFor="message" className="block text-[12px] font-bold uppercase tracking-wider mb-2.5" style={{ color: focused === "message" ? "#F8A991" : "rgba(255,255,255,0.4)", transition: "color 0.3s ease" }}>Message *</label>
                          <div className="relative">
                            <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center pointer-events-none transition-all duration-300" style={{ color: focused === "message" ? "#F8A991" : "rgba(255,255,255,0.2)" }}>
                              <MessageSquare className="w-[18px] h-[18px]" />
                            </div>
                            <textarea
                              id="message" name="message" required rows={5}
                              value={formData.message} onChange={handleChange}
                              onFocus={() => focus("message")} onBlur={blur}
                              placeholder="Décrivez votre projet ou votre demande..."
                              className="w-full pl-12 pr-4 py-4 rounded-xl text-[15px] text-white placeholder:text-white/20 outline-none transition-all duration-300 resize-none border-none"
                              style={{
                                backgroundColor: focused === "message" ? "rgba(248,169,145,0.06)" : "rgba(255,255,255,0.04)",
                                boxShadow: focused === "message" ? "0 0 0 1px rgba(248,169,145,0.25), 0 0 30px rgba(248,169,145,0.06)" : "none",
                              }}
                            />
                            <div className="absolute bottom-0 left-1/2 h-[2px] rounded-full transition-all duration-500 ease-out" style={{ width: focused === "message" ? "85%" : "0%", transform: "translateX(-50%)", background: "linear-gradient(90deg, transparent, #F8A991, transparent)" }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />

                    {/* Captcha — custom glass style */}
                    <div
                      className="flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/[0.03] group"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                      onClick={() => {
                        const captchaEl = document.querySelector('[role="button"]') as HTMLElement;
                        if (captchaEl) captchaEl.click();
                      }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300" style={{ backgroundColor: captchaVerified ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)" }}>
                        {captchaVerified ? (
                          <CheckCircle className="w-5 h-5" style={{ color: "#22c55e" }} />
                        ) : (
                          <Shield className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-bold" style={{ color: captchaVerified ? "#22c55e" : "rgba(255,255,255,0.6)" }}>
                          {captchaVerified ? "Identité vérifiée" : "Vérifier votre identité"}
                        </p>
                        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                          {captchaVerified ? "Vous pouvez envoyer votre message" : "Cliquez pour compléter la vérification"}
                        </p>
                      </div>
                      {captchaVerified && (
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#22c55e" }} />
                      )}
                    </div>
                    {/* Hidden actual captcha */}
                    <div className="sr-only">
                      <IconCaptcha onVerify={setCaptchaVerified} disabled={isSubmitting} />
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || !captchaVerified}
                        className="relative inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl font-bold text-[15px] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none hover:scale-[1.03] active:scale-[0.98] overflow-hidden group"
                        style={{
                          backgroundColor: "#F8A991",
                          color: "#151F2D",
                          boxShadow: isSubmitting || !captchaVerified ? "none" : "0 0 40px rgba(248,169,145,0.2), 0 6px 20px rgba(248,169,145,0.15)",
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-5 h-5 border-2 border-[#151F2D]/20 border-t-[#151F2D] rounded-full animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            Envoyer le message
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                        Vos données sont sécurisées et ne seront jamais partagées.
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. CTA ═══ */}
      <CTASectionV2 />
    </>
  );
}
