"use client";

import { useState, useEffect } from "react";
import {
  type Question,
  type QuestionOption,
  type Section,
} from "@/hooks/admin/useNeedsAnalysisTemplates";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Trash2,
  ChevronDown,
  Save,
  GripVertical,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface QuestionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question;
  sectionId: string;
  allSections: Section[];
  onSave: (question: Question) => void;
}

const questionTypes: { value: Question["type"]; label: string }[] = [
  { value: "text", label: "Texte court" },
  { value: "textarea", label: "Texte long" },
  { value: "select", label: "Liste déroulante" },
  { value: "radio", label: "Choix unique" },
  { value: "checkbox", label: "Choix multiples" },
  { value: "number", label: "Nombre" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Téléphone" },
];

const requiresOptions = (type: Question["type"]) =>
  ["select", "radio", "checkbox"].includes(type);

export function QuestionEditor({
  open,
  onOpenChange,
  question,
  sectionId,
  allSections,
  onSave,
}: QuestionEditorProps) {
  const [formData, setFormData] = useState<Question>(question);
  const [showConditional, setShowConditional] = useState(false);

  useEffect(() => {
    setFormData(question);
    setShowConditional(!!question.conditionalLogic);
  }, [question]);

  const handleTypeChange = (type: Question["type"]) => {
    setFormData((prev) => ({
      ...prev,
      type,
      options: requiresOptions(type) && !prev.options?.length
        ? [
            { id: uuidv4(), label: "Option 1", value: "option_1" },
            { id: uuidv4(), label: "Option 2", value: "option_2" },
          ]
        : prev.options,
    }));
  };

  const addOption = () => {
    const newOption: QuestionOption = {
      id: uuidv4(),
      label: `Option ${(formData.options?.length || 0) + 1}`,
      value: `option_${(formData.options?.length || 0) + 1}`,
    };
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }));
  };

  const updateOption = (id: string, updates: Partial<QuestionOption>) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.map((opt) =>
        opt.id === id ? { ...opt, ...updates } : opt
      ),
    }));
  };

  const deleteOption = (id: string) => {
    if ((formData.options?.length || 0) <= 1) {
      toast.error("Vous devez garder au moins une option");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((opt) => opt.id !== id),
    }));
  };

  const handleSave = () => {
    if (!formData.label.trim()) {
      toast.error("Le libellé de la question est obligatoire");
      return;
    }

    if (requiresOptions(formData.type) && (!formData.options || formData.options.length === 0)) {
      toast.error("Ajoutez au moins une option de réponse");
      return;
    }

    // Clean up conditional logic if disabled
    const finalData = { ...formData };
    if (!showConditional) {
      delete finalData.conditionalLogic;
    }

    onSave(finalData);
  };

  // Get all questions from other sections for conditional logic
  const allOtherQuestions = allSections.flatMap((section) =>
    section.questions
      .filter((q) => q.id !== question.id)
      .map((q) => ({
        ...q,
        sectionTitle: section.title,
      }))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Modifier la question</DialogTitle>
          <DialogDescription>
            Configurez les paramètres de la question
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Question text */}
            <div className="space-y-2">
              <Label htmlFor="question-label">
                Question <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="question-label"
                value={formData.label}
                onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="Entrez votre question..."
                rows={2}
              />
            </div>

            {/* Question type */}
            <div className="space-y-2">
              <Label>Type de réponse</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleTypeChange(v as Question["type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options for select/radio/checkbox */}
            {requiresOptions(formData.type) && (
              <div className="space-y-3">
                <Label>Options de réponse</Label>
                <div className="space-y-2">
                  {formData.options?.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        value={option.label}
                        onChange={(e) =>
                          updateOption(option.id, {
                            label: e.target.value,
                            value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                          })
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:text-destructive flex-shrink-0"
                        onClick={() => deleteOption(option.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                    onClick={addOption}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une option
                  </Button>
                </div>

                {/* Allow "Other" option */}
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="allow-other"
                    checked={formData.allowOther || false}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, allowOther: checked }))
                    }
                  />
                  <Label htmlFor="allow-other" className="cursor-pointer text-sm">
                    Autoriser "Autre" avec texte libre
                  </Label>
                </div>
              </div>
            )}

            {/* Placeholder */}
            {["text", "textarea", "number", "email", "phone"].includes(formData.type) && (
              <div className="space-y-2">
                <Label htmlFor="placeholder">Placeholder (optionnel)</Label>
                <Input
                  id="placeholder"
                  value={formData.placeholder || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, placeholder: e.target.value }))
                  }
                  placeholder="Texte d'aide..."
                />
              </div>
            )}

            {/* Help text */}
            <div className="space-y-2">
              <Label htmlFor="help-text">Texte d'aide (optionnel)</Label>
              <Input
                id="help-text"
                value={formData.helpText || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, helpText: e.target.value }))
                }
                placeholder="Instructions ou informations supplémentaires..."
              />
            </div>

            {/* Required */}
            <div className="flex items-center gap-2">
              <Switch
                id="required"
                checked={formData.required}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, required: checked }))
                }
              />
              <Label htmlFor="required" className="cursor-pointer">
                Question obligatoire
              </Label>
            </div>

            {/* Conditional Logic */}
            <Collapsible open={showConditional} onOpenChange={setShowConditional}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>Logique conditionnelle</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      showConditional ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Afficher cette question uniquement si une autre question a une valeur spécifique
                  </p>

                  {allOtherQuestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Ajoutez d'autres questions pour utiliser la logique conditionnelle
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Si la question</Label>
                        <Select
                          value={formData.conditionalLogic?.questionId || ""}
                          onValueChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              conditionalLogic: {
                                questionId: v,
                                operator: prev.conditionalLogic?.operator || "equals",
                                value: prev.conditionalLogic?.value || "",
                              },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une question" />
                          </SelectTrigger>
                          <SelectContent>
                            {allOtherQuestions.map((q) => (
                              <SelectItem key={q.id} value={q.id}>
                                <span className="text-muted-foreground text-xs">
                                  {q.sectionTitle} •
                                </span>{" "}
                                {q.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Condition</Label>
                          <Select
                            value={formData.conditionalLogic?.operator || "equals"}
                            onValueChange={(v) =>
                              setFormData((prev) => ({
                                ...prev,
                                conditionalLogic: {
                                  questionId: prev.conditionalLogic?.questionId || "",
                                  operator: v as "equals" | "not_equals" | "contains",
                                  value: prev.conditionalLogic?.value || "",
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Est égal à</SelectItem>
                              <SelectItem value="not_equals">N'est pas égal à</SelectItem>
                              <SelectItem value="contains">Contient</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Valeur</Label>
                          <Input
                            value={formData.conditionalLogic?.value || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                conditionalLogic: {
                                  questionId: prev.conditionalLogic?.questionId || "",
                                  operator: prev.conditionalLogic?.operator || "equals",
                                  value: e.target.value,
                                },
                              }))
                            }
                            placeholder="Valeur attendue"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
