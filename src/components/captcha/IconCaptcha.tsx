"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RefreshCw } from "lucide-react";
import { CaptchaModal } from "./CaptchaModal";
import { generateChallenge, verifyAnswer } from "./captcha-data";
import type { IconCaptchaProps, GeneratedChallenge } from "./types";
import { cn } from "@/lib/utils";

export function IconCaptcha({
  onVerify,
  disabled = false,
  className,
}: IconCaptchaProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [challenge, setChallenge] = useState<GeneratedChallenge | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Generate initial challenge
  useEffect(() => {
    if (!challenge) {
      setChallenge(generateChallenge());
    }
  }, [challenge]);

  // Notify parent when verification state changes
  useEffect(() => {
    onVerify(isVerified);
  }, [isVerified, onVerify]);

  const handleCheckboxClick = useCallback(() => {
    if (disabled || isVerified) return;
    setIsModalOpen(true);
  }, [disabled, isVerified]);

  const handleRefresh = useCallback(() => {
    setChallenge(generateChallenge());
    setStep(1);
    setIsShaking(false);
  }, []);

  const handleIconClick = useCallback(
    (index: number) => {
      if (!challenge) return;

      const isCorrect = verifyAnswer(challenge, index);

      if (isCorrect) {
        if (step === 1) {
          // Move to step 2 with new challenge
          setStep(2);
          setChallenge(generateChallenge());
        } else {
          // Verification complete!
          setIsVerified(true);
          setIsModalOpen(false);
        }
      } else {
        // Wrong answer - shake and reset
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          handleRefresh();
        }, 500);
      }
    },
    [challenge, step, handleRefresh]
  );

  const handleReset = useCallback(() => {
    setIsVerified(false);
    setStep(1);
    setChallenge(generateChallenge());
  }, []);

  return (
    <>
      {/* Checkbox UI */}
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border-2",
          "bg-secondary/30 transition-all duration-200",
          isVerified
            ? "border-green-500/50 bg-green-500/5"
            : "border-border/50 hover:border-primary/30",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && !isVerified && "cursor-pointer",
          className
        )}
        onClick={handleCheckboxClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCheckboxClick();
          }
        }}
      >
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <motion.div
            className={cn(
              "w-6 h-6 rounded-md border-2 flex items-center justify-center",
              "transition-colors duration-200",
              isVerified
                ? "bg-green-500 border-green-500"
                : "border-muted-foreground/50 hover:border-primary"
            )}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence>
              {isVerified && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Label */}
          <span
            className={cn(
              "text-sm font-medium select-none",
              isVerified ? "text-green-600 dark:text-green-400" : "text-foreground"
            )}
          >
            {isVerified ? "Vérification réussie" : "Je ne suis pas un robot"}
          </span>
        </div>

        {/* Reset button (shown when verified) */}
        {isVerified && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            title="Recommencer la vérification"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        )}
      </div>

      {/* Modal */}
      {challenge && (
        <CaptchaModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          step={step}
          challenge={challenge}
          onIconClick={handleIconClick}
          onRefresh={handleRefresh}
          isShaking={isShaking}
        />
      )}
    </>
  );
}
