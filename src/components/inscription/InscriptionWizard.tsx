"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import { StepIndicator } from "./StepIndicator";
import { StepTypeSelection } from "./steps/StepTypeSelection";
import { StepSessionSelection, AvailableSession } from "./steps/StepSessionSelection";
import { StepNeedsAnalysis, NeedsQuestion } from "./steps/StepNeedsAnalysis";
import { StepPersonalInfo, PersonalInfoData } from "./steps/StepPersonalInfo";

const STEPS = [
  { label: "Profil" },
  { label: "Session" },
  { label: "Besoins" },
  { label: "Inscription" },
];

// Default questions if no template found
const DEFAULT_QUESTIONS: NeedsQuestion[] = [
  {
    id: "secteur",
    type: "select",
    label: "Quel est votre secteur d'activité ?",
    required: true,
    options: ["Industrie", "BTP", "Transport", "Logistique", "Commerce", "Services", "Autre"],
    section: "Votre situation",
  },
  {
    id: "poste",
    type: "text",
    label: "Quel est votre poste actuel ?",
    required: true,
    placeholder: "Ex: Chef d'équipe, Opérateur...",
    section: "Votre situation",
  },
  {
    id: "experience",
    type: "select",
    label: "Depuis combien de temps exercez-vous dans ce domaine ?",
    required: true,
    options: ["Moins d'1 an", "1 à 3 ans", "3 à 5 ans", "5 à 10 ans", "Plus de 10 ans"],
    section: "Votre situation",
  },
  {
    id: "objectifs",
    type: "textarea",
    label: "Quels sont vos objectifs pour cette formation ?",
    required: false,
    placeholder: "Décrivez ce que vous souhaitez apprendre ou améliorer...",
    section: "Vos attentes",
  },
  {
    id: "contraintes",
    type: "textarea",
    label: "Avez-vous des contraintes particulières ?",
    required: false,
    placeholder: "Handicap, restrictions médicales, contraintes horaires...",
    section: "Vos attentes",
  },
];

interface InscriptionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formation: {
    id: string;
    title: string;
    price?: string | null;
  };
}

export function InscriptionWizard({
  open,
  onOpenChange,
  formation,
}: InscriptionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Form state
  const [type, setType] = useState<"particulier" | "entreprise" | null>(null);
  const [sessions, setSessions] = useState<AvailableSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<NeedsQuestion[]>(DEFAULT_QUESTIONS);
  const [needsAnalysisResponses, setNeedsAnalysisResponses] = useState<Record<string, string | number>>({});
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    civilite: "",
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    nombre_participants: 1,
  });

  // Load sessions when dialog opens
  useEffect(() => {
    if (open && formation.id) {
      loadSessions();
      loadNeedsAnalysisTemplate();
    }
  }, [open, formation.id]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        resetForm();
      }, 300); // Wait for dialog close animation
    }
  }, [open]);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, start_date, end_date, lieu, format_type, places_disponibles, places_max")
        .eq("formation_id", formation.id)
        .eq("is_public", true)
        .in("status", ["planifiee", "confirmee"])
        .gte("start_date", new Date().toISOString())
        .order("start_date");

      if (error) throw error;

      // Filter sessions with available places
      const availableSessions = (data || []).filter(
        (s) => s.places_disponibles > 0
      );
      setSessions(availableSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Erreur lors du chargement des sessions");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadNeedsAnalysisTemplate = async () => {
    const supabase = createClient();

    try {
      // Try to get formation-specific template first, then default
      const { data } = await supabase
        .from("needs_analysis_templates")
        .select("questions")
        .or(`formation_id.eq.${formation.id},is_default.eq.true`)
        .eq("active", true)
        .order("formation_id", { nullsFirst: false }) // Prefer formation-specific
        .limit(1)
        .maybeSingle();

      if (data?.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions as NeedsQuestion[]);
      }
    } catch (error) {
      console.error("Error loading needs analysis template:", error);
      // Keep default questions
    }
  };

  const handleSubmit = async () => {
    if (!selectedSessionId || !type) {
      toast.error("Veuillez sélectionner une session");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      // 1. Create formation_request
      const { data: request, error: requestError } = await supabase
        .from("formation_requests")
        .insert({
          formation_id: formation.id,
          formation_title: formation.title,
          type_demandeur: type,
          session_id: selectedSessionId,
          prenom: personalInfo.prenom,
          nom: personalInfo.nom,
          email: personalInfo.email,
          telephone: personalInfo.telephone,
          entreprise: personalInfo.entreprise || null,
          siret: personalInfo.siret || null,
          ville: personalInfo.ville || null,
          code_postal: personalInfo.code_postal || null,
          adresse: personalInfo.adresse || null,
          nombre_participants: personalInfo.nombre_participants || 1,
          urgence: "normale",
          status: "nouvelle",
          demandeur_est_participant: type === "particulier",
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // 2. Create needs_analysis_response if we have responses
      let needsAnalysisId = null;
      if (Object.keys(needsAnalysisResponses).length > 0) {
        const { data: analysis, error: analysisError } = await supabase
          .from("needs_analysis_responses")
          .insert({
            formation_request_id: request.id,
            session_id: selectedSessionId,
            respondent_name: `${personalInfo.prenom} ${personalInfo.nom}`,
            respondent_email: personalInfo.email,
            responses: needsAnalysisResponses,
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!analysisError && analysis) {
          needsAnalysisId = analysis.id;
        }
      }

      // 3. Create inscription
      const { error: inscriptionError } = await supabase
        .from("inscriptions")
        .insert({
          session_id: selectedSessionId,
          formation_request_id: request.id,
          needs_analysis_response_id: needsAnalysisId,
          participant_prenom: personalInfo.prenom,
          participant_nom: personalInfo.nom,
          participant_email: personalInfo.email,
          participant_telephone: personalInfo.telephone,
          civilite: personalInfo.civilite,
          type_inscription: type,
          status: "en_attente",
        });

      if (inscriptionError) throw inscriptionError;

      // 4. Decrement available places (using RPC if available, otherwise direct update)
      const selectedSession = sessions.find((s) => s.id === selectedSessionId);
      if (selectedSession) {
        await supabase
          .from("sessions")
          .update({
            places_disponibles: Math.max(0, selectedSession.places_disponibles - 1),
          })
          .eq("id", selectedSessionId);
      }

      toast.success(
        "Inscription enregistrée ! Vous recevrez une confirmation par email.",
        { duration: 5000 }
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Inscription error:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setType(null);
    setSelectedSessionId(null);
    setNeedsAnalysisResponses({});
    setPersonalInfo({
      civilite: "",
      prenom: "",
      nom: "",
      email: "",
      telephone: "",
      nombre_participants: 1,
    });
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || null;
  const hasQuestions = questions.length > 0;

  // Handle step navigation with dynamic skipping
  const goToNextStep = () => {
    if (currentStep === 1 && !hasQuestions) {
      // Skip needs analysis if no questions
      setCurrentStep(3);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep === 3 && !hasQuestions) {
      // Skip needs analysis when going back
      setCurrentStep(1);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <span>Inscription à la formation</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground truncate">
            {formation.title}
          </p>
        </DialogHeader>

        <StepIndicator currentStep={currentStep} steps={STEPS} />

        <div className="flex-1 overflow-hidden">
          {currentStep === 0 && (
            <StepTypeSelection
              value={type}
              onChange={setType}
              onNext={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 1 && (
            <StepSessionSelection
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              onSelect={setSelectedSessionId}
              onNext={goToNextStep}
              onBack={() => setCurrentStep(0)}
              isLoading={isLoadingSessions}
            />
          )}

          {currentStep === 2 && hasQuestions && (
            <StepNeedsAnalysis
              questions={questions}
              responses={needsAnalysisResponses}
              onChange={(id, value) =>
                setNeedsAnalysisResponses((prev) => ({ ...prev, [id]: value }))
              }
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
              onSkip={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <StepPersonalInfo
              type={type!}
              data={personalInfo}
              onChange={(field, value) =>
                setPersonalInfo((prev) => ({ ...prev, [field]: value }))
              }
              onSubmit={handleSubmit}
              onBack={goToPrevStep}
              isSubmitting={isSubmitting}
              formation={formation}
              session={selectedSession}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
