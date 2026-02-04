"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  Clock,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

interface Question {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "number" | "date" | "email" | "phone";
  label: string;
  required: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  helpText?: string;
  allowOther?: boolean;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  questions: Section[];
}

interface Invitation {
  id: string;
  template_id: string;
  recipient_name: string | null;
  recipient_email: string;
  expires_at: string;
  used_at: string | null;
}

type PageState = "loading" | "invalid" | "expired" | "completed" | "form";

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [template, setTemplate] = useState<Template | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[] | number>>({});
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [respondentInfo, setRespondentInfo] = useState({
    name: "",
    email: "",
    role: "",
    company: "",
  });

  // Load invitation and template
  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      try {
        // Get invitation
        const { data: invitationData, error: invitationError } = await supabase
          .from("needs_analysis_invitations")
          .select("*")
          .eq("token", token)
          .single();

        if (invitationError || !invitationData) {
          setPageState("invalid");
          return;
        }

        // Check if already used
        if (invitationData.used_at) {
          setPageState("completed");
          return;
        }

        // Check if expired
        if (new Date(invitationData.expires_at) < new Date()) {
          setPageState("expired");
          return;
        }

        setInvitation(invitationData);

        // Pre-fill respondent info
        setRespondentInfo((prev) => ({
          ...prev,
          name: invitationData.recipient_name || "",
          email: invitationData.recipient_email || "",
        }));

        // Get template
        const { data: templateData, error: templateError } = await supabase
          .from("needs_analysis_templates")
          .select("*")
          .eq("id", invitationData.template_id)
          .single();

        if (templateError || !templateData) {
          setPageState("invalid");
          return;
        }

        setTemplate({
          ...templateData,
          questions: templateData.questions as Section[],
        });
        setPageState("form");
      } catch {
        setPageState("invalid");
      }
    };

    loadData();
  }, [token]);

  const sections = template?.questions || [];
  const currentSection = sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;
  const totalSections = sections.length;

  const totalQuestions = useMemo(() => {
    return sections.reduce((acc, s) => acc + s.questions.length, 0);
  }, [sections]);

  const answeredQuestions = useMemo(() => {
    return Object.keys(responses).filter((key) => {
      const value = responses[key];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== "";
    }).length;
  }, [responses]);

  const progressPercentage = totalQuestions > 0
    ? Math.round((answeredQuestions / totalQuestions) * 100)
    : 0;

  // Check if current section is valid
  const isSectionValid = useMemo(() => {
    if (!currentSection) return true;
    return currentSection.questions
      .filter((q) => q.required)
      .every((q) => {
        const value = responses[q.id];
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== "";
      });
  }, [currentSection, responses]);

  const handleResponseChange = (questionId: string, value: string | string[] | number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, optionValue: string, checked: boolean) => {
    setResponses((prev) => {
      const currentValues = (prev[questionId] as string[]) || [];
      if (checked) {
        return { ...prev, [questionId]: [...currentValues, optionValue] };
      } else {
        return { ...prev, [questionId]: currentValues.filter((v) => v !== optionValue) };
      }
    });
  };

  const handleOtherChange = (questionId: string, value: string) => {
    setOtherValues((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!isSectionValid) {
      toast.error("Veuillez répondre à toutes les questions obligatoires");
      return;
    }
    if (!isLastSection) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (!isFirstSection) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!isSectionValid) {
      toast.error("Veuillez répondre à toutes les questions obligatoires");
      return;
    }

    if (!respondentInfo.email) {
      toast.error("Veuillez renseigner votre email");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Merge "other" values into responses
      const finalResponses = { ...responses };
      Object.entries(otherValues).forEach(([questionId, value]) => {
        if (value) {
          const currentValue = finalResponses[questionId];
          if (Array.isArray(currentValue)) {
            finalResponses[questionId] = [...currentValue, `Autre: ${value}`];
          } else {
            finalResponses[questionId] = `Autre: ${value}`;
          }
        }
      });

      // Create the response record
      const { error: responseError } = await supabase
        .from("needs_analysis_responses")
        .insert({
          id: uuidv4(),
          template_id: template!.id,
          respondent_name: respondentInfo.name || null,
          respondent_email: respondentInfo.email,
          respondent_role: respondentInfo.role || null,
          responses: {
            ...finalResponses,
            _company: respondentInfo.company || null,
          },
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

      if (responseError) throw responseError;

      // Mark invitation as used
      if (invitation) {
        await supabase
          .from("needs_analysis_invitations")
          .update({ used_at: new Date().toISOString() })
          .eq("id", invitation.id);
      }

      setPageState("completed");
      toast.success("Merci pour vos réponses !");
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: Question, sectionIndex: number, questionIndex: number) => {
    const value = responses[question.id];

    return (
      <div key={question.id} className="space-y-3">
        <Label className="text-base flex items-start gap-2">
          <span className="text-muted-foreground text-sm font-normal">
            {sectionIndex + 1}.{questionIndex + 1}
          </span>
          <span className="flex-1">
            {question.label}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </span>
        </Label>

        {question.helpText && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 -mt-1">
            <Info className="h-3 w-3 flex-shrink-0" />
            {question.helpText}
          </p>
        )}

        {question.type === "text" && (
          <Input
            value={(value as string) || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder || "Votre réponse..."}
          />
        )}

        {question.type === "textarea" && (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder || "Votre réponse..."}
            rows={4}
          />
        )}

        {question.type === "number" && (
          <Input
            type="number"
            value={(value as number) || ""}
            onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value) || 0)}
            placeholder={question.placeholder || "0"}
          />
        )}

        {question.type === "email" && (
          <Input
            type="email"
            value={(value as string) || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder || "email@exemple.com"}
          />
        )}

        {question.type === "phone" && (
          <Input
            type="tel"
            value={(value as string) || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder || "+33 6 00 00 00 00"}
          />
        )}

        {question.type === "date" && (
          <Input
            type="date"
            value={(value as string) || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
          />
        )}

        {question.type === "select" && (
          <Select
            value={(value as string) || ""}
            onValueChange={(v) => handleResponseChange(question.id, v)}
          >
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
        )}

        {question.type === "radio" && (
          <div className="space-y-3">
            <RadioGroup
              value={(value as string) || ""}
              onValueChange={(v) => handleResponseChange(question.id, v)}
              className="space-y-2"
            >
              {question.options?.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={opt.value} id={`${question.id}-${opt.id}`} />
                  <Label
                    htmlFor={`${question.id}-${opt.id}`}
                    className="font-normal cursor-pointer"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {question.allowOther && (
              <div className="flex items-center gap-2 pl-6">
                <Label className="text-sm text-muted-foreground">Autre :</Label>
                <Input
                  value={otherValues[question.id] || ""}
                  onChange={(e) => handleOtherChange(question.id, e.target.value)}
                  placeholder="Précisez..."
                  className="flex-1"
                />
              </div>
            )}
          </div>
        )}

        {question.type === "checkbox" && (
          <div className="space-y-3">
            <div className="space-y-2">
              {question.options?.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`${question.id}-${opt.id}`}
                    checked={((value as string[]) || []).includes(opt.value)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(question.id, opt.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`${question.id}-${opt.id}`}
                    className="font-normal cursor-pointer"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </div>
            {question.allowOther && (
              <div className="flex items-center gap-2 pl-6">
                <Label className="text-sm text-muted-foreground">Autre :</Label>
                <Input
                  value={otherValues[question.id] || ""}
                  onChange={(e) => handleOtherChange(question.id, e.target.value)}
                  placeholder="Précisez..."
                  className="flex-1"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du questionnaire...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (pageState === "invalid") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Lien invalide</h2>
            <p className="text-muted-foreground">
              Ce lien de questionnaire n'existe pas ou n'est plus valide.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired token
  if (pageState === "expired") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold">Lien expiré</h2>
            <p className="text-muted-foreground">
              Ce lien de questionnaire a expiré. Veuillez contacter l'expéditeur pour obtenir un nouveau lien.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed state
  if (pageState === "completed") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Merci !</h2>
            <p className="text-muted-foreground">
              Vos réponses ont bien été enregistrées. Nous vous contacterons prochainement.
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form state
  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl">{template?.name}</CardTitle>
              {template?.description && (
                <CardDescription className="mt-1">{template.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{answeredQuestions}/{totalQuestions} questions répondues</span>
              <span>Section {currentSectionIndex + 1}/{totalSections}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Respondent info (only on first section) */}
      {isFirstSection && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Vos informations</CardTitle>
            <CardDescription>
              Ces informations nous permettront de vous contacter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="respondent-name">Nom complet</Label>
                <Input
                  id="respondent-name"
                  value={respondentInfo.name}
                  onChange={(e) => setRespondentInfo((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respondent-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="respondent-email"
                  type="email"
                  value={respondentInfo.email}
                  onChange={(e) => setRespondentInfo((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="jean.dupont@exemple.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="respondent-company">Entreprise</Label>
                <Input
                  id="respondent-company"
                  value={respondentInfo.company}
                  onChange={(e) => setRespondentInfo((prev) => ({ ...prev, company: e.target.value }))}
                  placeholder="Nom de l'entreprise"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respondent-role">Fonction</Label>
                <Input
                  id="respondent-role"
                  value={respondentInfo.role}
                  onChange={(e) => setRespondentInfo((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="Responsable RH"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Section */}
      {currentSection && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                {currentSectionIndex + 1}
              </span>
              <div>
                <CardTitle className="text-lg">{currentSection.title}</CardTitle>
                {currentSection.description && (
                  <CardDescription>{currentSection.description}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentSection.questions.map((question, qIndex) =>
              renderQuestion(question, currentSectionIndex, qIndex)
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={isFirstSection}
          className="flex-1 sm:flex-none"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>

        <div className="flex-1 hidden sm:block" />

        {isLastSection ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isSectionValid}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Envoyer mes réponses
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isSectionValid}
            className="flex-1 sm:flex-none"
          >
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
