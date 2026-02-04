"use client";

import { useState, useCallback, useRef } from "react";
import {
  useNeedsAnalysisTemplateMutations,
  type Section,
  type Question,
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface ImportPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

type ImportStep = "upload" | "processing" | "preview" | "complete";

interface ExtractedSection {
  title: string;
  description?: string;
  questions: {
    label: string;
    type: string;
    required?: boolean;
    options?: string[];
  }[];
}

interface ExtractedData {
  name: string;
  description: string;
  sections: Section[];
}

export function ImportPdfDialog({ open, onOpenChange, onImportComplete }: ImportPdfDialogProps) {
  const { createTemplate } = useNeedsAnalysisTemplateMutations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const resetState = () => {
    setStep("upload");
    setFile(null);
    setProgress(0);
    setExtractedData(null);
    setError(null);
    setExpandedSections(new Set([0]));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
    } else {
      toast.error("Veuillez sélectionner un fichier PDF");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(null);
      } else {
        toast.error("Veuillez sélectionner un fichier PDF");
        e.target.value = "";
      }
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const processFile = async () => {
    if (!file) return;

    setStep("processing");
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      // Read the PDF file
      const formData = new FormData();
      formData.append("file", file);

      // Call the AI extraction API
      const response = await fetch("/api/admin/analyse-besoins/import-pdf", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'extraction");
      }

      const data = await response.json();
      setProgress(100);

      // Transform the extracted data
      const transformedData: ExtractedData = {
        name: data.name || file.name.replace(".pdf", ""),
        description: data.description || "",
        sections: (data.sections || []).map((section: ExtractedSection) => ({
          id: uuidv4(),
          title: section.title || "Section sans titre",
          description: section.description || "",
          questions: (section.questions || []).map((q: { label: string; type: string; required?: boolean; options?: string[] }) => ({
            id: uuidv4(),
            label: q.label || "Question",
            type: (q.type || "text") as Question["type"],
            required: q.required || false,
            options: q.options?.map((opt: string) => ({
              id: uuidv4(),
              label: opt,
              value: opt.toLowerCase().replace(/\s+/g, "_"),
            })),
          })),
        })),
      };

      // If no sections were extracted, create a default structure
      if (transformedData.sections.length === 0) {
        transformedData.sections = [{
          id: uuidv4(),
          title: "Section 1",
          description: "",
          questions: [],
        }];
      }

      setExtractedData(transformedData);
      setExpandedSections(new Set([0]));
      setStep("preview");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du traitement du fichier";
      setError(message);
      toast.error(message);
      setStep("upload");
    }
  };

  const handleImport = async () => {
    if (!extractedData) return;

    try {
      await createTemplate.mutateAsync({
        name: extractedData.name,
        description: extractedData.description,
        questions: extractedData.sections,
        active: false, // Start as inactive for review
      });

      setStep("complete");
      toast.success("Questionnaire importé avec succès");

      setTimeout(() => {
        handleClose();
        onImportComplete();
      }, 1500);
    } catch {
      toast.error("Erreur lors de la création du questionnaire");
    }
  };

  const totalQuestions = extractedData?.sections.reduce(
    (acc, section) => acc + section.questions.length,
    0
  ) || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Importer un PDF
          </DialogTitle>
          <DialogDescription className="text-sm">
            Importez un PDF et laissez l&apos;IA extraire automatiquement les questions
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {/* Upload Step */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!file ? handleSelectFile : undefined}
                className={`
                  border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors
                  ${!file ? "cursor-pointer" : ""}
                  ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                  ${file ? "bg-primary/5 border-primary" : "hover:border-muted-foreground/50"}
                `}
              >
                {file ? (
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base break-all">{file.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} Mo
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base">Glissez-déposez votre PDF ici</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">ou cliquez pour sélectionner</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {error && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="p-3 sm:p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Format attendu</h4>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <li>• PDF de questionnaire structuré</li>
                  <li>• Sections avec titres identifiables</li>
                  <li>• Questions numérotées ou à puces</li>
                </ul>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="space-y-6 py-8">
              <div className="text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="font-medium">Analyse en cours...</p>
                  <p className="text-sm text-muted-foreground">
                    Extraction des questions de votre PDF
                  </p>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {progress < 30 && "Lecture du document..."}
                {progress >= 30 && progress < 60 && "Identification des sections..."}
                {progress >= 60 && progress < 90 && "Extraction des questions..."}
                {progress >= 90 && "Finalisation..."}
              </p>
            </div>
          )}

          {/* Preview Step */}
          {step === "preview" && extractedData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm">Titre du questionnaire</Label>
                <Input
                  id="title"
                  value={extractedData.name}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, name: e.target.value })
                  }
                  className="text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {extractedData.sections.length} section{extractedData.sections.length > 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {totalQuestions} question{totalQuestions > 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="space-y-2">
                {extractedData.sections.map((section, sIndex) => {
                  const isExpanded = expandedSections.has(sIndex);
                  return (
                    <div key={section.id} className="border rounded-lg bg-muted/20 overflow-hidden">
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 p-3 hover:bg-muted/30 transition-colors text-left"
                        onClick={() => toggleSection(sIndex)}
                      >
                        <ChevronRight
                          className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {sIndex + 1}
                        </span>
                        <span className="font-medium text-sm truncate flex-1">{section.title}</span>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {section.questions.length}
                        </Badge>
                      </button>

                      {isExpanded && section.questions.length > 0 && (
                        <div className="px-3 pb-3 space-y-2">
                          {section.questions.map((q, qIndex) => (
                            <div
                              key={q.id}
                              className="text-sm flex items-start gap-2 p-2 bg-background rounded-lg"
                            >
                              <span className="text-xs font-medium text-muted-foreground flex-shrink-0 mt-0.5">
                                {sIndex + 1}.{qIndex + 1}
                              </span>
                              <span className="flex-1 text-sm">{q.label}</span>
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {q.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}

                      {isExpanded && section.questions.length === 0 && (
                        <div className="px-3 pb-3">
                          <p className="text-sm text-muted-foreground italic">
                            Aucune question extraite dans cette section
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Complete Step */}
          {step === "complete" && (
            <div className="text-center space-y-4 py-8">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-lg">Import réussi !</p>
                <p className="text-sm text-muted-foreground">
                  Le questionnaire a été créé et est prêt à être modifié
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 sm:px-6 py-4 border-t flex-shrink-0 gap-2 flex-col sm:flex-row">
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Annuler
              </Button>
              <Button onClick={processFile} disabled={!file} className="w-full sm:w-auto">
                <Sparkles className="h-4 w-4 mr-2" />
                Analyser
              </Button>
            </>
          )}

          {step === "processing" && (
            <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
              Annuler
            </Button>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")} className="w-full sm:w-auto">
                Retour
              </Button>
              <Button onClick={handleImport} disabled={createTemplate.isPending} className="w-full sm:w-auto">
                {createTemplate.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Importer
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
