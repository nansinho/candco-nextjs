"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Hero images for rotation - one per pole
const heroImages = [
  { src: "/pole-security.jpg", alt: "Formation Sécurité et Prévention" },
  { src: "/pole-childhood.jpg", alt: "Formation Petite Enfance" },
  { src: "/pole-health.jpg", alt: "Formation Santé" },
];

const stats = [
  { value: "25 000+", label: "Professionnels formés" },
  { value: "98%", label: "Taux de réussite" },
  { value: "15+", label: "Années d'expertise" },
];

// Timing constants
const IMAGE_DURATION = 5000; // 5 seconds per image
const KENBURNS_DURATION = 5; // Ken Burns animation duration in seconds
const CROSSFADE_DURATION = 800; // 0.8 second crossfade

export default function HeroCarousel() {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const shouldAnimate = !isMobile && !shouldReduceMotion;
  const shouldRotate = !shouldReduceMotion && heroImages.length > 1;

  // Image rotation with crossfade
  useEffect(() => {
    if (!shouldRotate || heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      setAnimationKey((prev) => prev + 1);

      setTimeout(() => {
        setIsTransitioning(false);
      }, CROSSFADE_DURATION);
    }, IMAGE_DURATION);

    return () => clearInterval(interval);
  }, [shouldRotate]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Images with Ken Burns effect */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => {
          const isActive = index === currentImageIndex;
          const isPrevious =
            index === (currentImageIndex - 1 + heroImages.length) % heroImages.length;

          return (
            <div
              key={`hero-${index}`}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive
                  ? "opacity-100"
                  : isPrevious && isTransitioning
                    ? "opacity-30"
                    : "opacity-0"
              }`}
              style={{ zIndex: isActive ? 2 : 1 }}
            >
              <Image
                key={isActive ? `active-${animationKey}` : `inactive-${index}`}
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className={`object-cover ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={index === 0 ? handleImageLoad : undefined}
                style={
                  shouldAnimate && isActive
                    ? {
                        animation: `kenburns ${KENBURNS_DURATION}s ease-out forwards`,
                      }
                    : undefined
                }
              />
            </div>
          );
        })}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background z-10" />
      </div>

      {/* Ken Burns keyframes */}
      <style jsx global>{`
        @keyframes kenburns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.12) translate(-2%, -1.5%);
          }
        }
      `}</style>

      {/* Content */}
      <div className="container-custom relative z-20 text-center py-20">
        {shouldAnimate ? (
          <motion.p
            className="text-sm text-muted-foreground mb-6 tracking-widest uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Centre de formation certifié Qualiopi
          </motion.p>
        ) : (
          <p className="text-sm text-muted-foreground mb-6 tracking-widest uppercase">
            Centre de formation certifié Qualiopi
          </p>
        )}

        {shouldAnimate ? (
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-tight mb-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Construisez votre{" "}
            <span className="text-primary font-medium">avenir professionnel</span>{" "}
            avec excellence
          </motion.h1>
        ) : (
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-tight mb-8 max-w-4xl mx-auto">
            Construisez votre{" "}
            <span className="text-primary font-medium">avenir professionnel</span>{" "}
            avec excellence
          </h1>
        )}

        {shouldAnimate ? (
          <motion.p
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Sécurité, Petite Enfance, Santé. Des formations certifiantes
            finançables via OPCO et dispositifs entreprise, conçues pour votre
            réussite.
          </motion.p>
        ) : (
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Sécurité, Petite Enfance, Santé. Des formations certifiantes
            finançables via OPCO et dispositifs entreprise, conçues pour votre
            réussite.
          </p>
        )}

        {shouldAnimate ? (
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/formations"
              className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Découvrir nos formations
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Nous contacter
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/formations"
              className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Découvrir nos formations
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        )}

        {/* Stats */}
        {shouldAnimate ? (
          <motion.div
            className="flex justify-center gap-6 sm:gap-12 lg:gap-20"
            initial={{ opacity: 0.4, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center min-w-[60px] sm:min-w-[80px] lg:min-w-[100px]"
              >
                <p className="text-2xl sm:text-3xl lg:text-4xl font-light mb-1 tabular-nums text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="flex justify-center gap-6 sm:gap-12 lg:gap-20">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center min-w-[60px] sm:min-w-[80px] lg:min-w-[100px]"
              >
                <p className="text-2xl sm:text-3xl lg:text-4xl font-light mb-1 tabular-nums text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
