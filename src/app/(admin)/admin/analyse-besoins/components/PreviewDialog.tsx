"use client";

import { type NeedsAnalysisTemplate } from "@/hooks/admin/useNeedsAnalysisTemplates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, FileText, Info } from "lucide-react";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: NeedsAnalysisTemplate | null;
}

export function PreviewDialog({ open, onOpenChange, template }: PreviewDialogProps) {
  if (!template) return null;

  const renderQuestionInput = (question: {
    type: string;
    placeholder?: string;
    options?: { id: string; label: string; value: string }[];
  }) => {
    switch (question.type) {
      case "text":
        return (
          <Input
            placeholder={question.placeholder || "Votre réponse..."}
            disabled
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={question.placeholder || "Votre réponse..."}
            rows={3}
            disabled
          />
        );
      case "number":
        return (
          <Input
            type="number"
            placeholder={question.placeholder || "0"}
            disabled
          />
        );
      case "email":
        return (
          <Input
            type="email"
            placeholder={question.placeholder || "email@exemple.com"}
            disabled
          />
        );
      case "phone":
        return (
          <Input
            type="tel"
            placeholder={question.placeholder || "+33 6 00 00 00 00"}
            disabled
          />
        );
      case "date":
        return <Input type="date" disabled />;
      case "select":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((opt) => (
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "radio":
        return (
          <RadioGroup disabled className="space-y-2">
            {question.options?.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={opt.id} />
                <Label htmlFor={opt.id} className="font-normal">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options?.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <Checkbox id={opt.id} disabled />
                <Label htmlFor={opt.id} className="font-normal">
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <Input placeholder="Votre réponse..." disabled />
        );
    }
  };

  const totalQuestions = template.questions.reduce(
    (acc, section) => acc + section.questions.length,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Prévisualisation
          </DialogTitle>
          <DialogDescription>
            Aperçu du questionnaire tel qu'il sera affiché aux répondants
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {/* Questionnaire Header */}
          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{template.name}</h2>
                {template.description && (
                  <p className="text-muted-foreground mt-1">{template.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="secondary">
                    {template.questions.length} sections
                  </Badge>
                  <Badge variant="secondary">{totalQuestions} questions</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {template.questions.map((section, sectionIndex) => (
              <div key={section.id} className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center gap-3 sticky top-0 bg-background py-2 z-10">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {sectionIndex + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{section.title}</h3>
                    {section.description && (
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-6 pl-11">
                  {section.questions.map((question, qIndex) => (
                    <div key={question.id} className="space-y-2">
                      <Label className="flex items-start gap-2">
                        <span className="text-muted-foreground text-sm">
                          {sectionIndex + 1}.{qIndex + 1}
                        </span>
                        <span className="flex-1">
                          {question.label}
                          {question.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </span>
                      </Label>
                      {question.helpText && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          {question.helpText}
                        </p>
                      )}
                      {renderQuestionInput(question)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit button preview */}
          <div className="mt-8 p-6 bg-muted/30 rounded-lg text-center">
            <Button disabled className="w-full sm:w-auto">
              Envoyer mes réponses
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Bouton de soumission (aperçu)
            </p>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
