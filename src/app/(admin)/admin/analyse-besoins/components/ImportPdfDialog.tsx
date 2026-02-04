"use client";

import { useState, useCallback } from "react";
import {
  useNeedsAnalysisTemplateMutations,
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface ImportPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

type ImportStep = "upload" | "processing" | "preview" | "complete";

interface ExtractedData {
  name: string;
  description: string;
  sections: Section[];
}

export function ImportPdfDialog({ open, onOpenChange, onImportComplete }: ImportPdfDialogProps) {
  const { createTemplate } = useNeedsAnalysisTemplateMutations();

  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetState = () => {
    setStep("upload");
    setFile(null);
    setProgress(0);
    setExtractedData(null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      toast.error("Veuillez sélectionner un fichier PDF");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Veuillez sélectionner un fichier PDF");
    }
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
        sections: data.sections?.map((section: { title: string; description?: string; questions: Array<{ label: string; type: string; required?: boolean; options?: string[] }> }) => ({
          id: uuidv4(),
          title: section.title,
          description: section.description || "",
          questions: section.questions?.map((q: { label: string; type: string; required?: boolean; options?: string[] }) => ({
            id: uuidv4(),
            label: q.label,
            type: q.type || "text",
            required: q.required || false,
            options: q.options?.map((opt: string) => ({
              id: uuidv4(),
              label: opt,
              value: opt.toLowerCase().replace(/\s+/g, "_"),
            })),
          })) || [],
        })) || [{
          id: uuidv4(),
          title: "Section 1",
          description: "",
          questions: [],
        }],
      };

      setExtractedData(transformedData);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du traitement du fichier");
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Importer IA
          </DialogTitle>
          <DialogDescription>
            Importez un PDF et laissez l'IA extraire automatiquement les questions
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 py-4">
          {/* Upload Step */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                  ${file ? "bg-primary/5 border-primary" : ""}
                `}
              >
                {file ? (
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
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
                      <p className="font-medium">Glissez-déposez votre PDF ici</p>
                      <p className="text-sm text-muted-foreground">ou cliquez pour sélectionner</p>
                    </div>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <Label htmlFor="pdf-upload" asChild>
                      <Button variant="outline" className="cursor-pointer">
                        Sélectionner un fichier
                      </Button>
                    </Label>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Format attendu</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• PDF généré par Claude ou autre IA</li>
                  <li>• Structure avec sections et questions</li>
                  <li>• Questions avec types de réponse (texte, choix, etc.)</li>
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
                    L'IA extrait les questions de votre PDF
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
            <ScrollArea className="h-[400px] -mx-6 px-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre du questionnaire</Label>
                  <Input
                    value={extractedData.name}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, name: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    {extractedData.sections.length} sections
                  </Badge>
                  <Badge variant="outline">{totalQuestions} questions</Badge>
                </div>

                <div className="space-y-3">
                  {extractedData.sections.map((section, sIndex) => (
                    <div key={section.id} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {sIndex + 1}
                        </span>
                        <span className="font-medium">{section.title}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {section.questions.length} questions
                        </Badge>
                      </div>
                      <div className="space-y-2 pl-8">
                        {section.questions.map((q, qIndex) => (
                          <div
                            key={q.id}
                            className="text-sm flex items-start gap-2 text-muted-foreground"
                          >
                            <span className="text-xs font-medium">
                              {sIndex + 1}.{qIndex + 1}
                            </span>
                            <span className="flex-1">{q.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {q.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
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

        <DialogFooter>
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={processFile} disabled={!file}>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyser
              </Button>
            </>
          )}

          {step === "processing" && (
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Retour
              </Button>
              <Button onClick={handleImport} disabled={createTemplate.isPending}>
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
