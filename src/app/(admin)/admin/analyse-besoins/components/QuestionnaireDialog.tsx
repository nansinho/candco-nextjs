"use client";

import { useState, useEffect } from "react";
import { useFormations } from "@/hooks/admin/useFormations";
import {
  useNeedsAnalysisTemplateMutations,
  type NeedsAnalysisTemplate,
  type Section,
  type Question,
  type QuestionOption,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Settings2,
  Loader2,
  Lock,
  Globe,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { QuestionEditor } from "./QuestionEditor";

interface QuestionnaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: NeedsAnalysisTemplate | null;
}

const questionTypeLabels: Record<Question["type"], string> = {
  text: "Texte court",
  textarea: "Texte long",
  select: "Liste déroulante",
  radio: "Choix unique",
  checkbox: "Choix multiples",
  number: "Nombre",
  date: "Date",
  email: "Email",
  phone: "Téléphone",
};

export function QuestionnaireDialog({
  open,
  onOpenChange,
  template,
}: QuestionnaireDialogProps) {
  const { data: formations = [] } = useFormations();
  const { createTemplate, updateTemplate } = useNeedsAnalysisTemplateMutations();

  const isEditing = !!template;

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formationId, setFormationId] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [active, setActive] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);

  // Question editor state
  const [editingQuestion, setEditingQuestion] = useState<{
    sectionId: string;
    question: Question;
  } | null>(null);

  // Reset form when opening/closing or when template changes
  useEffect(() => {
    if (open) {
      if (template) {
        setName(template.name);
        setDescription(template.description || "");
        setFormationId(template.formation_id);
        setIsDefault(template.is_default || false);
        setActive(template.active ?? true);
        setSections(template.questions || []);
      } else {
        // New template
        setName("");
        setDescription("");
        setFormationId(null);
        setIsDefault(false);
        setActive(true);
        setSections([
          {
            id: uuidv4(),
            title: "Section 1",
            description: "",
            questions: [],
          },
        ]);
      }
    }
  }, [open, template]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    if (sections.length === 0) {
      toast.error("Ajoutez au moins une section");
      return;
    }

    const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
    if (totalQuestions === 0) {
      toast.error("Ajoutez au moins une question");
      return;
    }

    try {
      if (isEditing && template) {
        await updateTemplate.mutateAsync({
          id: template.id,
          name,
          description,
          formation_id: formationId,
          is_default: isDefault,
          active,
          questions: sections,
        });
        toast.success("Questionnaire mis à jour");
      } else {
        await createTemplate.mutateAsync({
          name,
          description,
          formation_id: formationId,
          is_default: isDefault,
          active,
          questions: sections,
        });
        toast.success("Questionnaire créé");
      }
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  // Section management
  const addSection = () => {
    setSections([
      ...sections,
      {
        id: uuidv4(),
        title: `Section ${sections.length + 1}`,
        description: "",
        questions: [],
      },
    ]);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSection = (id: string) => {
    if (sections.length <= 1) {
      toast.error("Vous devez garder au moins une section");
      return;
    }
    setSections(sections.filter((s) => s.id !== id));
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    const index = sections.findIndex((s) => s.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  // Question management
  const addQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: uuidv4(),
      type: "text",
      label: "Nouvelle question",
      required: false,
    };
    setEditingQuestion({ sectionId, question: newQuestion });
  };

  const saveQuestion = (sectionId: string, question: Question) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        const existingIndex = s.questions.findIndex((q) => q.id === question.id);
        if (existingIndex >= 0) {
          // Update existing
          const newQuestions = [...s.questions];
          newQuestions[existingIndex] = question;
          return { ...s, questions: newQuestions };
        } else {
          // Add new
          return { ...s, questions: [...s.questions, question] };
        }
      })
    );
    setEditingQuestion(null);
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        return { ...s, questions: s.questions.filter((q) => q.id !== questionId) };
      })
    );
  };

  const moveQuestion = (sectionId: string, questionId: string, direction: "up" | "down") => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        const index = s.questions.findIndex((q) => q.id === questionId);
        if (index === -1) return s;
        if (direction === "up" && index === 0) return s;
        if (direction === "down" && index === s.questions.length - 1) return s;

        const newQuestions = [...s.questions];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newQuestions[index], newQuestions[targetIndex]] = [
          newQuestions[targetIndex],
          newQuestions[index],
        ];
        return { ...s, questions: newQuestions };
      })
    );
  };

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <>
      <Dialog open={open && !editingQuestion} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Modifier le questionnaire" : "Nouveau questionnaire"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifiez les paramètres et questions du questionnaire"
                : "Créez un nouveau questionnaire d'analyse des besoins"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Titre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Analyse des besoins Formation IA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibilité</Label>
                  <Select
                    value={formationId || "all"}
                    onValueChange={(v) => setFormationId(v === "all" ? null : v)}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Toutes les formations</span>
                        </div>
                      </SelectItem>
                      {formations.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span>{f.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du questionnaire..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is-default"
                    checked={isDefault}
                    onCheckedChange={setIsDefault}
                  />
                  <Label htmlFor="is-default" className="cursor-pointer">
                    Questionnaire par défaut
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="active" checked={active} onCheckedChange={setActive} />
                  <Label htmlFor="active" className="cursor-pointer">
                    Actif
                  </Label>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une section
                  </Button>
                </div>

                <Accordion type="multiple" defaultValue={sections.map((s) => s.id)} className="space-y-2">
                  {sections.map((section, sectionIndex) => (
                    <AccordionItem
                      key={section.id}
                      value={section.id}
                      className="border rounded-lg bg-muted/20 px-0"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                            {sectionIndex + 1}
                          </span>
                          <span className="font-medium text-left">
                            {section.title}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {section.questions.length} question(s)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          {/* Section settings */}
                          <div className="flex items-start gap-4 p-3 bg-background rounded-lg border">
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Nom de la section</Label>
                                  <Input
                                    value={section.title}
                                    onChange={(e) =>
                                      updateSection(section.id, { title: e.target.value })
                                    }
                                    placeholder="Nom de la section"
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Description (optionnel)</Label>
                                  <Input
                                    value={section.description || ""}
                                    onChange={(e) =>
                                      updateSection(section.id, { description: e.target.value })
                                    }
                                    placeholder="Description..."
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveSection(section.id, "up")}
                                disabled={sectionIndex === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveSection(section.id, "down")}
                                disabled={sectionIndex === sections.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => deleteSection(section.id)}
                                disabled={sections.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Questions list */}
                          <div className="space-y-2">
                            {section.questions.map((question, qIndex) => (
                              <div
                                key={question.id}
                                className="flex items-center gap-3 p-3 bg-background rounded-lg border hover:border-primary/50 transition-colors"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-muted-foreground w-6">
                                  {sectionIndex + 1}.{qIndex + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {question.label}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-muted-foreground">
                                      {questionTypeLabels[question.type]}
                                    </span>
                                    {question.required && (
                                      <span className="text-xs text-destructive">
                                        • Obligatoire
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => moveQuestion(section.id, question.id, "up")}
                                    disabled={qIndex === 0}
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => moveQuestion(section.id, question.id, "down")}
                                    disabled={qIndex === section.questions.length - 1}
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      setEditingQuestion({ sectionId: section.id, question })
                                    }
                                  >
                                    <Settings2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => deleteQuestion(section.id, question.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full border-dashed"
                              onClick={() => addQuestion(section.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter une question
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Editor Dialog */}
      {editingQuestion && (
        <QuestionEditor
          open={!!editingQuestion}
          onOpenChange={(open) => !open && setEditingQuestion(null)}
          question={editingQuestion.question}
          sectionId={editingQuestion.sectionId}
          allSections={sections}
          onSave={(q) => saveQuestion(editingQuestion.sectionId, q)}
        />
      )}
    </>
  );
}
