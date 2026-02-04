"use client";

import { useState, useMemo } from "react";
import { useNeedsAnalysisTemplates } from "@/hooks/admin/useNeedsAnalysisTemplates";
import { useNeedsAnalysis } from "@/hooks/admin/useNeedsAnalysis";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardList,
  FileText,
  MessageSquare,
  Plus,
  Sparkles,
  Send,
  CheckCircle2,
  Clock,
} from "lucide-react";

// Import components
import { QuestionnairesTab } from "./components/QuestionnairesTab";
import { ResponsesTab } from "./components/ResponsesTab";
import { QuestionnaireDialog } from "./components/QuestionnaireDialog";
import { ImportPdfDialog } from "./components/ImportPdfDialog";
import { SendEmailDialog } from "./components/SendEmailDialog";
import { PreviewDialog } from "./components/PreviewDialog";
import type { NeedsAnalysisTemplate } from "@/hooks/admin/useNeedsAnalysisTemplates";

export default function AnalyseBesoinsPage() {
  const { data: templates = [], isLoading: templatesLoading } = useNeedsAnalysisTemplates();
  const { data: responses = [], isLoading: responsesLoading } = useNeedsAnalysis();

  const [activeTab, setActiveTab] = useState("questionnaires");

  // Dialog states
  const [questionnaireDialogOpen, setQuestionnaireDialogOpen] = useState(false);
  const [importPdfDialogOpen, setImportPdfDialogOpen] = useState(false);
  const [sendEmailDialogOpen, setSendEmailDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NeedsAnalysisTemplate | null>(null);

  // Computed stats
  const stats = useMemo(() => {
    const activeTemplates = templates.filter((t) => t.active).length;
    const totalResponses = responses.length;
    const totalQuestions = templates.reduce((acc, t) => acc + (t.questions_count || 0), 0);
    const completedResponses = responses.filter((r) => r.status === "completed").length;
    const activationRate = totalResponses > 0
      ? Math.round((completedResponses / totalResponses) * 100)
      : 100;

    return {
      activeTemplates,
      totalResponses,
      totalQuestions,
      activationRate,
    };
  }, [templates, responses]);

  // Handlers
  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setQuestionnaireDialogOpen(true);
  };

  const handleEdit = (template: NeedsAnalysisTemplate) => {
    setSelectedTemplate(template);
    setQuestionnaireDialogOpen(true);
  };

  const handlePreview = (template: NeedsAnalysisTemplate) => {
    setSelectedTemplate(template);
    setPreviewDialogOpen(true);
  };

  const handleSendEmail = (template: NeedsAnalysisTemplate) => {
    setSelectedTemplate(template);
    setSendEmailDialogOpen(true);
  };

  const handleImportComplete = () => {
    setImportPdfDialogOpen(false);
  };

  const isLoading = templatesLoading || responsesLoading;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ClipboardList}
        title="Analyse des besoins"
        description="Questionnaires d'analyse des besoins de formation"
      >
        <Button variant="outline" onClick={() => setSendEmailDialogOpen(true)}>
          <Send className="h-4 w-4 mr-2" />
          Envoyer
        </Button>
        <Button variant="outline" onClick={() => setImportPdfDialogOpen(true)}>
          <Sparkles className="h-4 w-4 mr-2" />
          Importer IA
        </Button>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau
        </Button>
      </AdminPageHeader>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 bg-secondary/30">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questionnaires actifs</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeTemplates}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réponses reçues</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResponses}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total questionnaires</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux d'activation</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activationRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="questionnaires" className="gap-2">
            <FileText className="h-4 w-4" />
            Questionnaires
          </TabsTrigger>
          <TabsTrigger value="responses" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Réponses ({responses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questionnaires" className="mt-4">
          <QuestionnairesTab
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onPreview={handlePreview}
            onSendEmail={handleSendEmail}
          />
        </TabsContent>

        <TabsContent value="responses" className="mt-4">
          <ResponsesTab />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <QuestionnaireDialog
        open={questionnaireDialogOpen}
        onOpenChange={setQuestionnaireDialogOpen}
        template={selectedTemplate}
      />

      <ImportPdfDialog
        open={importPdfDialogOpen}
        onOpenChange={setImportPdfDialogOpen}
        onImportComplete={handleImportComplete}
      />

      <SendEmailDialog
        open={sendEmailDialogOpen}
        onOpenChange={setSendEmailDialogOpen}
        template={selectedTemplate || templates[0] || null}
        templates={templates}
      />

      <PreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        template={selectedTemplate}
      />
    </div>
  );
}
