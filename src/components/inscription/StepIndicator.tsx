"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="mb-6">
      {/* Progress bar */}
      <div className="relative h-1.5 bg-secondary rounded-full mb-4 overflow-hidden">
        <div
          className="absolute h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step circles */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center text-center",
                isPending && "opacity-50"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary/20 text-primary border-2 border-primary",
                  isPending && "bg-secondary text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="hidden sm:block text-xs mt-1.5 max-w-[80px]">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
