"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft, SkipForward, ClipboardList } from "lucide-react";

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
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Group questions by section
  const questionsBySection = useMemo(() => {
    return questions.reduce((acc, q) => {
      const section = q.section || "Général";
      if (!acc[section]) acc[section] = [];
      acc[section].push(q);
      return acc;
    }, {} as Record<string, NeedsQuestion[]>);
  }, [questions]);

  const sections = Object.keys(questionsBySection);
  const totalSections = sections.length;
  const currentSection = sections[currentSectionIndex];
  const currentQuestions = questionsBySection[currentSection] || [];
  const isLastSection = currentSectionIndex === totalSections - 1;
  const isFirstSection = currentSectionIndex === 0;

  // Check if current section questions are answered
  const isSectionValid = currentQuestions
    .filter((q) => q.required)
    .every((q) => {
      const value = responses[q.id];
      return value !== undefined && value !== "";
    });

  // Check if all required questions are answered
  const isValid = questions
    .filter((q) => q.required)
    .every((q) => {
      const value = responses[q.id];
      return value !== undefined && value !== "";
    });

  const progressPercentage = ((currentSectionIndex + 1) / totalSections) * 100;

  const handleNextSection = () => {
    if (isLastSection) {
      onNext();
    } else {
      setCurrentSectionIndex((prev) => prev + 1);
    }
  };

  const handlePrevSection = () => {
    if (isFirstSection) {
      onBack();
    } else {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

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
    <div className="space-y-5">
      {/* Header with section indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Analyse des besoins</h3>
        </div>
        {totalSections > 1 && (
          <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Section {currentSectionIndex + 1} / {totalSections}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalSections > 1 && (
        <div className="space-y-1">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progressPercentage)}% complété
          </p>
        </div>
      )}

      {/* Current section title */}
      {totalSections > 1 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {currentSectionIndex + 1}
          </span>
          <h4 className="font-medium text-primary">{currentSection}</h4>
        </div>
      )}

      <ScrollArea className="h-[260px] pr-4">
        <div className="space-y-4">
          {currentQuestions.map(renderQuestion)}
        </div>
      </ScrollArea>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handlePrevSection} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isFirstSection ? "Retour" : "Précédent"}
        </Button>
        {onSkip && isFirstSection && (
          <Button variant="ghost" onClick={onSkip} className="px-3">
            <SkipForward className="mr-2 h-4 w-4" />
            Passer
          </Button>
        )}
        <Button
          onClick={handleNextSection}
          disabled={!isSectionValid}
          className="flex-1"
        >
          {isLastSection ? "Continuer" : "Suivant"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
