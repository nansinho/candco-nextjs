"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft, SkipForward } from "lucide-react";

export interface NeedsQuestion {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "number";
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  section?: string;
}

interface StepNeedsAnalysisProps {
  questions: NeedsQuestion[];
  responses: Record<string, string | number>;
  onChange: (questionId: string, value: string | number) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}

export function StepNeedsAnalysis({
  questions,
  responses,
  onChange,
  onNext,
  onBack,
  onSkip,
}: StepNeedsAnalysisProps) {
  // Group questions by section
  const questionsBySection = questions.reduce((acc, q) => {
    const section = q.section || "Général";
    if (!acc[section]) acc[section] = [];
    acc[section].push(q);
    return acc;
  }, {} as Record<string, NeedsQuestion[]>);

  const sections = Object.keys(questionsBySection);

  // Check if all required questions are answered
  const isValid = questions
    .filter((q) => q.required)
    .every((q) => {
      const value = responses[q.id];
      return value !== undefined && value !== "";
    });

  const renderQuestion = (question: NeedsQuestion) => {
    const value = responses[question.id] ?? "";

    return (
      <div key={question.id} className="space-y-2">
        <Label className="flex items-center gap-1">
          {question.label}
          {question.required && <span className="text-destructive">*</span>}
        </Label>

        {question.type === "text" && (
          <Input
            value={value as string}
            onChange={(e) => onChange(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        )}

        {question.type === "number" && (
          <Input
            type="number"
            value={value as number}
            onChange={(e) => onChange(question.id, parseInt(e.target.value) || 0)}
            placeholder={question.placeholder}
          />
        )}

        {question.type === "textarea" && (
          <Textarea
            value={value as string}
            onChange={(e) => onChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={3}
          />
        )}

        {question.type === "select" && question.options && (
          <Select
            value={value as string}
            onValueChange={(v) => onChange(question.id, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {question.type === "radio" && question.options && (
          <RadioGroup
            value={value as string}
            onValueChange={(v) => onChange(question.id, v)}
            className="space-y-2"
          >
            {question.options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label
                  htmlFor={`${question.id}-${option}`}
                  className="font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Analyse des besoins</h3>
        <p className="text-sm text-muted-foreground">
          Ces informations nous aident à personnaliser votre formation
        </p>
      </div>

      <ScrollArea className="h-[320px] pr-4">
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section} className="space-y-4">
              {sections.length > 1 && (
                <h4 className="font-medium text-sm text-primary border-b pb-2">
                  {section}
                </h4>
              )}
              {questionsBySection[section].map(renderQuestion)}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        {onSkip && (
          <Button variant="ghost" onClick={onSkip} className="px-3">
            <SkipForward className="mr-2 h-4 w-4" />
            Passer
          </Button>
        )}
        <Button onClick={onNext} disabled={!isValid} className="flex-1">
          Continuer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
