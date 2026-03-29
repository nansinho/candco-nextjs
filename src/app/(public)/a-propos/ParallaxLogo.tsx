"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export default function ParallaxLogo() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0.1, 0.45], [0, 1]);
  const scale = useTransform(scrollYProgress, [0.1, 0.55], [0.5, 1.1]);

  return (
    <div
      ref={ref}
      className="relative h-[50vh] sm:h-[60vh] overflow-hidden"
      style={{ perspective: "1px" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 -top-[20%] -bottom-[20%]"
        style={{
          backgroundImage: "url('/images/fonds_sections/fond_pompier.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #151F2D 0%, transparent 25%, transparent 75%, #151F2D 100%)",
        }}
      />

      {/* Logo — scroll-animated */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={
          prefersReducedMotion
            ? { opacity: 1, scale: 1 }
            : { opacity, scale }
        }
      >
        <Image
          src="/logo.svg"
          alt="C&Co Formation"
          width={280}
          height={280}
          className="w-40 sm:w-56 lg:w-72 h-auto drop-shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        />
      </motion.div>
    </div>
  );
}
