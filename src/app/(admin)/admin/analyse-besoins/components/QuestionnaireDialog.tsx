"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormations } from "@/hooks/admin/useFormations";
import {
  useNeedsAnalysisTemplateMutations,
  type NeedsAnalysisTemplate,
  type Section,
  type Question,
} from "@/hooks/admin/useNeedsAnalysisTemplates";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  EyeOff,
  ChevronRight,
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

// Sortable Section Item Component
interface SortableSectionProps {
  section: Section;
  sectionIndex: number;
  sections: Section[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  onAddQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onMoveQuestion: (questionId: string, direction: "up" | "down") => void;
  onReorderQuestions: (newQuestions: Question[]) => void;
  isDragging?: boolean;
}

function SortableSectionItem({
  section,
  sectionIndex,
  sections,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onMove,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onMoveQuestion,
  onReorderQuestions,
  isDragging,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSectionDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSectionDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = section.questions.findIndex((q) => q.id === active.id);
    const newIndex = section.questions.findIndex((q) => q.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderQuestions(arrayMove(section.questions, oldIndex, newIndex));
    }
  };

  if (isDragging) {
    return (
      <div className="border rounded-lg bg-primary/5 border-primary p-4">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
            {sectionIndex + 1}
          </span>
          <span className="font-medium text-sm truncate flex-1">
            {section.title}
          </span>
          <span className="text-xs text-muted-foreground">
            {section.questions.length} question{section.questions.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg bg-muted/20 overflow-hidden"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted/30">
        <button
          type="button"
          className="touch-none cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </button>
        <button
          type="button"
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={onToggle}
        >
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
            {sectionIndex + 1}
          </span>
          <span className="font-medium text-sm truncate flex-1 text-left">
            {section.title}
          </span>
        </button>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {section.questions.length}
        </span>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Section settings */}
          <div className="flex flex-col sm:flex-row gap-2 p-2 bg-background rounded-lg border">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                value={section.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Nom de la section"
                className="h-8 text-sm"
              />
              <Input
                value={section.description || ""}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Description (optionnel)"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-1 justify-end sm:justify-start">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onMove("up")}
                disabled={sectionIndex === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onMove("down")}
                disabled={sectionIndex === sections.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onDelete}
                disabled={sections.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Questions list with drag and drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleQuestionDragEnd}
          >
            <SortableContext
              items={section.questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5">
                {section.questions.map((question, qIndex) => (
                  <SortableQuestionItem
                    key={question.id}
                    question={question}
                    sectionIndex={sectionIndex}
                    questionIndex={qIndex}
                    totalQuestions={section.questions.length}
                    onEdit={() => onEditQuestion(question)}
                    onDelete={() => onDeleteQuestion(question.id)}
                    onMove={(dir) => onMoveQuestion(question.id, dir)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed h-8"
            onClick={onAddQuestion}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Ajouter une question
          </Button>
        </div>
      )}
    </div>
  );
}

// Sortable Question Item Component
interface SortableQuestionProps {
  question: Question;
  sectionIndex: number;
  questionIndex: number;
  totalQuestions: number;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  isDragging?: boolean;
}

function SortableQuestionItem({
  question,
  sectionIndex,
  questionIndex,
  totalQuestions,
  onEdit,
  onDelete,
  onMove,
  isDragging,
}: SortableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isItemDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isItemDragging ? 0.5 : 1,
  };

  if (isDragging) {
    return (
      <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg border-2 border-primary">
        <GripVertical className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="text-xs text-muted-foreground w-6 flex-shrink-0">
          {sectionIndex + 1}.{questionIndex + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{question.label}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-background rounded-lg border hover:border-primary/50 transition-colors group"
    >
      <button
        type="button"
        className="touch-none cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </button>
      <span className="text-xs text-muted-foreground w-6 flex-shrink-0">
        {sectionIndex + 1}.{questionIndex + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{question.label}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {questionTypeLabels[question.type]}
          </span>
          {question.required && (
            <span className="text-xs text-destructive">• obligatoire</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 hidden sm:inline-flex"
          onClick={() => onMove("up")}
          disabled={questionIndex === 0}
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 hidden sm:inline-flex"
          onClick={() => onMove("down")}
          disabled={questionIndex === totalQuestions - 1}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onEdit}
        >
          <Settings2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

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
  const [visibility, setVisibility] = useState<string>("all"); // "all" | "private" | formation_id
  const [active, setActive] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  // Question editor state
  const [editingQuestion, setEditingQuestion] = useState<{
    sectionId: string;
    question: Question;
  } | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reset form when opening/closing or when template changes
  useEffect(() => {
    if (open) {
      if (template) {
        setName(template.name);
        setDescription(template.description || "");
        // Determine visibility
        if (template.formation_id) {
          setVisibility(template.formation_id);
        } else if (template.is_default) {
          setVisibility("all");
        } else {
          setVisibility("private");
        }
        setActive(template.active ?? true);
        setSections(template.questions || []);
        setExpandedSections(new Set(template.questions?.map(s => s.id) || []));
      } else {
        // New template
        setName("");
        setDescription("");
        setVisibility("all");
        setActive(true);
        const initialSection = {
          id: uuidv4(),
          title: "Section 1",
          description: "",
          questions: [],
        };
        setSections([initialSection]);
        setExpandedSections(new Set([initialSection.id]));
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

    // Determine formation_id and is_default based on visibility
    const formationId = visibility === "all" || visibility === "private" ? null : visibility;
    // "all" → is_default=true (public for all formations)
    // "private" → is_default=false (private questionnaire)
    // formation_id → is_default=false (specific formation)
    const shouldBeDefault = visibility === "all";

    try {
      if (isEditing && template) {
        await updateTemplate.mutateAsync({
          id: template.id,
          name,
          description,
          formation_id: formationId,
          is_default: shouldBeDefault,
          active,
          questions: sections,
        });
        toast.success("Questionnaire mis à jour");
      } else {
        await createTemplate.mutateAsync({
          name,
          description,
          formation_id: formationId,
          is_default: shouldBeDefault,
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
    const newSection = {
      id: uuidv4(),
      title: `Section ${sections.length + 1}`,
      description: "",
      questions: [],
    };
    setSections([...sections, newSection]);
    setExpandedSections(prev => new Set([...prev, newSection.id]));
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
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    const index = sections.findIndex((s) => s.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    setSections(arrayMove(sections, index, targetIndex));
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Section drag handlers
  const handleSectionDragStart = (event: DragStartEvent) => {
    const section = sections.find(s => s.id === event.active.id);
    if (section) {
      setActiveSection(section);
    }
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSection(null);

    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      setSections(arrayMove(sections, oldIndex, newIndex));
    }
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
          const newQuestions = [...s.questions];
          newQuestions[existingIndex] = question;
          return { ...s, questions: newQuestions };
        } else {
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

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        return { ...s, questions: arrayMove(s.questions, index, targetIndex) };
      })
    );
  };

  const reorderQuestions = useCallback((sectionId: string, newQuestions: Question[]) => {
    setSections(sections.map((s) => {
      if (s.id !== sectionId) return s;
      return { ...s, questions: newQuestions };
    }));
  }, [sections]);

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <>
      <Dialog open={open && !editingQuestion} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-3xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-lg">
              {isEditing ? "Modifier le questionnaire" : "Nouveau questionnaire"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {isEditing
                ? "Modifiez les paramètres et questions du questionnaire"
                : "Créez un nouveau questionnaire d'analyse des besoins"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            <div className="space-y-5">
              {/* Basic info */}
              <div className="space-y-4">
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
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger id="visibility" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 flex-shrink-0" />
                          <span>Toutes les formations</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <EyeOff className="h-4 w-4 flex-shrink-0" />
                          <span>Privé (non attaché)</span>
                        </div>
                      </SelectItem>
                      {formations.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{f.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description du questionnaire..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch id="active" checked={active} onCheckedChange={setActive} />
                  <Label htmlFor="active" className="cursor-pointer text-sm">
                    Actif
                  </Label>
                </div>
              </div>

              {/* Sections with drag and drop */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSection}>
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Ajouter une section</span>
                    <span className="sm:hidden">Section</span>
                  </Button>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleSectionDragStart}
                  onDragEnd={handleSectionDragEnd}
                >
                  <SortableContext
                    items={sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {sections.map((section, sectionIndex) => (
                        <SortableSectionItem
                          key={section.id}
                          section={section}
                          sectionIndex={sectionIndex}
                          sections={sections}
                          isExpanded={expandedSections.has(section.id)}
                          onToggle={() => toggleSection(section.id)}
                          onUpdate={(updates) => updateSection(section.id, updates)}
                          onDelete={() => deleteSection(section.id)}
                          onMove={(dir) => moveSection(section.id, dir)}
                          onAddQuestion={() => addQuestion(section.id)}
                          onEditQuestion={(q) => setEditingQuestion({ sectionId: section.id, question: q })}
                          onDeleteQuestion={(qId) => deleteQuestion(section.id, qId)}
                          onMoveQuestion={(qId, dir) => moveQuestion(section.id, qId, dir)}
                          onReorderQuestions={(newQuestions) => reorderQuestions(section.id, newQuestions)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeSection ? (
                      <SortableSectionItem
                        section={activeSection}
                        sectionIndex={sections.findIndex(s => s.id === activeSection.id)}
                        sections={sections}
                        isExpanded={false}
                        onToggle={() => {}}
                        onUpdate={() => {}}
                        onDelete={() => {}}
                        onMove={() => {}}
                        onAddQuestion={() => {}}
                        onEditQuestion={() => {}}
                        onDeleteQuestion={() => {}}
                        onMoveQuestion={() => {}}
                        onReorderQuestions={() => {}}
                        isDragging
                      />
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>
          </div>

          <DialogFooter className="px-4 sm:px-6 py-4 border-t flex-shrink-0 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isPending} className="flex-1 sm:flex-none">
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
