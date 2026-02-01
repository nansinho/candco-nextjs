"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Loader2, Plus, Trash2, Save, Building2, Calendar,
  FileText, Target, BookOpen, Settings, Briefcase, BarChart3, CheckCircle2,
  AlertCircle, Check, Library, Search
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { badgeStyles, badgeBase } from "@/components/admin/badgeStyles";

// ============== TYPES & SCHEMAS ==============

interface Organization {
  id: string;
  name: string;
  logo_url: string | null;
}

interface Category {
  id: string;
  name: string;
  pole_id: string | null;
}

interface Session {
  id: string;
  start_date: string;
  end_date: string | null;
  lieu: string | null;
  places_max: number;
  places_disponibles: number;
  status: string;
}

// Field configuration for score calculation
const FIELD_CONFIG: Record<string, { weight: number; category: string; label: string; isArray?: boolean; isNested?: string }> = {
  title: { weight: 3, category: "general", label: "Titre" },
  subtitle: { weight: 1, category: "general", label: "Sous-titre" },
  description: { weight: 2, category: "general", label: "Description" },
  pole: { weight: 2, category: "general", label: "Pôle" },
  category_id: { weight: 1, category: "general", label: "Catégorie" },
  duration: { weight: 2, category: "pratique", label: "Durée" },
  price_intra_value: { weight: 1, category: "pratique", label: "Prix intra" },
  price_inter_value: { weight: 1, category: "pratique", label: "Prix inter" },
  nombre_participants: { weight: 1, category: "pratique", label: "Nb participants" },
  format_lieu: { weight: 1, category: "pratique", label: "Format/Lieu" },
  delai_acces: { weight: 1, category: "pratique", label: "Délai accès" },
  certification: { weight: 1, category: "pratique", label: "Certification" },
  prerequis: { weight: 1, category: "pratique", label: "Prérequis", isArray: true },
  public_vise: { weight: 1, category: "pratique", label: "Public visé", isArray: true },
  financement: { weight: 1, category: "pratique", label: "Financement", isArray: true },
  objectifs_generaux: { weight: 2, category: "objectifs", label: "Obj. généraux", isArray: true },
  objectifs_operationnels: { weight: 2, category: "objectifs", label: "Obj. opérationnels", isArray: true },
  competences_visees: { weight: 1, category: "objectifs", label: "Compétences", isArray: true },
  programme: { weight: 3, category: "programme", label: "Programme", isArray: true },
  "modalites.methodes": { weight: 1, category: "modalites", label: "Méthodes", isNested: "modalites" },
  "modalites.moyens": { weight: 1, category: "modalites", label: "Moyens", isNested: "modalites" },
  encadrement_pedagogique: { weight: 1, category: "modalites", label: "Encadrement" },
  accessibilite: { weight: 1, category: "modalites", label: "Accessibilité" },
  "modalites.evaluation": { weight: 1, category: "indicateurs", label: "Évaluation", isNested: "modalites" },
  lien_objectifs_evaluation: { weight: 2, category: "indicateurs", label: "Lien Obj/Eval" },
  resultats_attendus: { weight: 1, category: "indicateurs", label: "Résultats", isArray: true },
  indicateurs_reussite: { weight: 1, category: "indicateurs", label: "Indicateurs", isArray: true },
  tracabilite: { weight: 1, category: "indicateurs", label: "Traçabilité", isArray: true },
  bibliographie_ouvrages: { weight: 1, category: "bibliographie", label: "Ouvrages" },
  bibliographie_articles: { weight: 2, category: "bibliographie", label: "Articles" },
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "Général",
  pratique: "Pratique",
  objectifs: "Objectifs",
  programme: "Programme",
  modalites: "Modalités",
  indicateurs: "Indicateurs",
  bibliographie: "Biblio",
};

const programmeModuleSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  items: z.array(z.string()).default([]),
});

const modalitesSchema = z.object({
  methodes: z.array(z.string()).default([]),
  moyens: z.array(z.string()).default([]),
  evaluation: z.array(z.string()).default([]),
});

const bibliographieSchema = z.object({
  ouvrages: z.array(z.object({
    auteurs: z.string().default(""),
    titre: z.string().default(""),
    annee: z.string().default(""),
    source: z.string().default(""),
  })).default([]),
  articles: z.array(z.object({
    auteurs: z.string().default(""),
    titre: z.string().default(""),
    annee: z.string().default(""),
    source: z.string().default(""),
    doi: z.string().optional(),
  })).default([]),
});

const customFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Le nom est requis"),
  value: z.string(),
  type: z.enum(["text", "number", "list"]).default("text"),
});

const formationSchema = z.object({
  id: z.string().min(1, "L'identifiant est requis"),
  title: z.string().min(1, "Le titre est requis"),
  subtitle: z.string().default(""),
  pole: z.string().min(1, "Le pôle est requis"),
  pole_name: z.string().min(1, "Le nom du pôle est requis"),
  duration: z.string().min(1, "La durée est requise"),
  price_intra_value: z.coerce.number().nullable().default(null),
  price_intra_unit: z.string().default("€ TTC la journée"),
  price_inter_value: z.coerce.number().nullable().default(null),
  price_inter_unit: z.string().default("€ TTC par apprenant"),
  image_url: z.string().default(""),
  popular: z.boolean().default(false),
  active: z.boolean().default(true),
  description: z.string().default(""),
  objectifs_generaux: z.array(z.string()).default([]),
  objectifs_operationnels: z.array(z.string()).default([]),
  competences_visees: z.array(z.string()).default([]),
  prerequis: z.array(z.string()).default([]),
  public_vise: z.array(z.string()).default([]),
  modalites: modalitesSchema.default({ methodes: [], moyens: [], evaluation: [] }),
  financement: z.array(z.string()).default([]),
  modalites_paiement: z.string().default(""),
  resultats_attendus: z.array(z.string()).default([]),
  indicateurs_reussite: z.array(z.string()).default([]),
  tracabilite: z.array(z.string()).default([]),
  lien_objectifs_evaluation: z.string().default(""),
  encadrement_pedagogique: z.string().default(""),
  nombre_participants: z.string().default(""),
  format_lieu: z.string().default(""),
  delai_acces: z.string().default(""),
  accessibilite: z.string().default(""),
  certification: z.string().default(""),
  meta_title: z.string().default(""),
  meta_description: z.string().default(""),
  slug: z.string().min(1, "Le slug est requis"),
  programme: z.array(programmeModuleSchema).default([]),
  bibliographie: bibliographieSchema.nullable().default(null),
  manual_validations: z.record(z.string(), z.boolean()).default({}),
  organization_id: z.string().nullable().default(null),
  category_id: z.string().nullable().default(null),
  custom_fields: z.array(customFieldSchema).default([]),
});

type FormationFormData = z.infer<typeof formationSchema>;

const poles = [
  { id: "securite-prevention", name: "Sécurité" },
  { id: "petite-enfance", name: "Petite Enfance" },
  { id: "sante", name: "Santé" },
];

const priceIntraUnits = [
  { value: "€ TTC la journée", label: "€ TTC la journée" },
  { value: "€ TTC par session", label: "€ TTC par session" },
  { value: "€ HT la journée", label: "€ HT la journée" },
];

const priceInterUnits = [
  { value: "€ TTC par apprenant", label: "€ TTC par apprenant" },
  { value: "€ HT par apprenant", label: "€ HT par apprenant" },
];

// ============== MAIN COMPONENT ==============

export default function AdminFormationEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [manualValidations, setManualValidations] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormationFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formationSchema) as any,
    defaultValues: {
      id: crypto.randomUUID(),
      title: "",
      subtitle: "",
      pole: "",
      pole_name: "",
      duration: "",
      price_intra_value: null,
      price_intra_unit: "€ TTC la journée",
      price_inter_value: null,
      price_inter_unit: "€ TTC par apprenant",
      image_url: "",
      popular: false,
      active: true,
      description: "",
      objectifs_generaux: [],
      objectifs_operationnels: [],
      competences_visees: [],
      prerequis: [],
      public_vise: [],
      modalites: { methodes: [], moyens: [], evaluation: [] },
      financement: [],
      resultats_attendus: [],
      indicateurs_reussite: [],
      tracabilite: [],
      programme: [],
      bibliographie: { ouvrages: [], articles: [] },
      manual_validations: {},
      custom_fields: [],
      slug: "",
    },
  });

  const { fields: programmeFields, append: appendProgramme, remove: removeProgramme } = useFieldArray({
    control,
    name: "programme",
  });

  const { fields: customFieldsFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({
    control,
    name: "custom_fields",
  });

  const formValues = watch();

  // ============== FILL SCORE CALCULATION ==============

  const fillScore = useMemo(() => {
    const watchedPole = formValues.pole;
    const isSante = watchedPole === "sante";

    let totalWeight = 0;
    let filledWeight = 0;
    const byCategory: Record<string, { filled: string[]; missing: string[] }> = {};

    Object.entries(FIELD_CONFIG).forEach(([fieldKey, config]) => {
      if (config.category === "bibliographie" && !isSante) return;

      if (!byCategory[config.category]) {
        byCategory[config.category] = { filled: [], missing: [] };
      }

      totalWeight += config.weight;

      let isFilled = false;

      if (manualValidations[fieldKey]) {
        isFilled = true;
      } else if (config.isNested) {
        const nestedPath = fieldKey.split(".");
        const nestedValue = (formValues as Record<string, unknown>)[nestedPath[0]] as Record<string, unknown> | undefined;
        const arr = nestedValue?.[nestedPath[1]] as string[] | undefined;
        isFilled = Array.isArray(arr) && arr.length > 0 && arr.some(v => v.trim() !== "");
      } else if (config.isArray) {
        const arr = (formValues as Record<string, unknown>)[fieldKey] as unknown[] | undefined;
        isFilled = Array.isArray(arr) && arr.length > 0;
      } else if (fieldKey === "bibliographie_ouvrages") {
        const biblio = formValues.bibliographie;
        isFilled = !!(biblio?.ouvrages && biblio.ouvrages.length > 0);
      } else if (fieldKey === "bibliographie_articles") {
        const biblio = formValues.bibliographie;
        isFilled = !!(biblio?.articles && biblio.articles.length > 0);
      } else {
        const value = (formValues as Record<string, unknown>)[fieldKey];
        isFilled = value !== null && value !== undefined && value !== "" && value !== 0;
      }

      if (isFilled) {
        filledWeight += config.weight;
        byCategory[config.category].filled.push(fieldKey);
      } else {
        byCategory[config.category].missing.push(fieldKey);
      }
    });

    const percentage = totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 0;
    const totalMissing = Object.values(byCategory).reduce((acc, cat) => acc + cat.missing.length, 0);

    return { percentage, totalMissing, byCategory };
  }, [formValues, manualValidations]);

  // ============== DATA FETCHING ==============

  useEffect(() => {
    fetchOrganizations();
    fetchCategories();
    if (!isNew && id) {
      fetchFormation();
      fetchSessions();
    }
  }, [id, isNew]);

  const fetchOrganizations = async () => {
    const { data } = await supabase.from("organizations").select("id, name, logo_url").order("name");
    if (data) setOrganizations(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name, pole_id").order("name");
    if (data) setCategories(data);
  };

  const fetchFormation = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("formations")
      .select("*")
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();

    if (error || !data) {
      toast.error("Formation non trouvée");
      router.push("/admin/formations");
      return;
    }

    const formData: FormationFormData = {
      ...data,
      objectifs_generaux: data.objectifs_generaux || [],
      objectifs_operationnels: data.objectifs_operationnels || [],
      competences_visees: data.competences_visees || [],
      prerequis: data.prerequis || [],
      public_vise: data.public_vise || [],
      financement: data.financement || [],
      resultats_attendus: data.resultats_attendus || [],
      indicateurs_reussite: data.indicateurs_reussite || [],
      tracabilite: data.tracabilite || [],
      programme: data.programme || [],
      modalites: data.modalites || { methodes: [], moyens: [], evaluation: [] },
      bibliographie: data.bibliographie || { ouvrages: [], articles: [] },
      manual_validations: data.manual_validations || {},
      custom_fields: data.custom_fields || [],
    };

    reset(formData);
    setManualValidations(formData.manual_validations || {});
    setLoading(false);
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    const { data } = await supabase
      .from("sessions")
      .select("id, start_date, end_date, lieu, places_max, places_disponibles, status")
      .eq("formation_id", id)
      .order("start_date", { ascending: false })
      .limit(10);

    if (data) setSessions(data);
    setLoadingSessions(false);
  };

  // ============== FORM HANDLERS ==============

  const handleManualValidation = (field: string, validated: boolean) => {
    const newValidations = { ...manualValidations, [field]: validated };
    if (!validated) {
      delete newValidations[field];
    }
    setManualValidations(newValidations);
    setValue("manual_validations", newValidations);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit = async (data: FormationFormData) => {
    setSaving(true);
    try {
      const formationData = {
        ...data,
        manual_validations: manualValidations,
      };

      if (isNew) {
        const { error } = await supabase.from("formations").insert(formationData);
        if (error) throw error;
        toast.success("Formation créée");
        router.push(`/admin/formations/${data.id}`);
      } else {
        const { error } = await supabase.from("formations").update(formationData).eq("id", id);
        if (error) throw error;
        toast.success("Formation mise à jour");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("formations").delete().eq("id", id);
      if (error) throw error;
      toast.success("Formation supprimée");
      router.push("/admin/formations");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  // ============== COMPONENTS ==============

  const ScoreIndicator = () => {
    const { percentage, totalMissing } = fillScore;
    const color = percentage < 50 ? "text-destructive" : percentage < 80 ? "text-orange-500" : "text-green-500";
    const bgColor = percentage < 50 ? "bg-destructive/10" : percentage < 80 ? "bg-orange-500/10" : "bg-green-500/10";
    const progressColor = percentage < 50 ? "[&>div]:bg-destructive" : percentage < 80 ? "[&>div]:bg-orange-500" : "[&>div]:bg-green-500";

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", bgColor)}>
              <div className="w-16">
                <Progress value={percentage} className={cn("h-2", progressColor)} />
              </div>
              <span className={cn("text-sm font-medium", color)}>{percentage}%</span>
              {totalMissing > 0 && (
                <Badge variant="outline" className="text-xs h-5 px-1.5">
                  {totalMissing} manquant{totalMissing > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="font-medium mb-1">Score de remplissage: {percentage}%</p>
            <p className="text-xs text-muted-foreground">
              {totalMissing > 0
                ? `${totalMissing} champ${totalMissing > 1 ? "s" : ""} non renseigné${totalMissing > 1 ? "s" : ""}`
                : "Tous les champs sont renseignés"
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const TabBadge = ({ category }: { category: string }) => {
    const stats = fillScore.byCategory[category];
    const missingCount = stats?.missing.length || 0;

    if (missingCount === 0) {
      return <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />;
    }

    return (
      <Badge className="h-4 min-w-4 px-1 text-[10px] bg-orange-500/10 text-orange-600 border border-orange-500/20 shrink-0">
        {missingCount}
      </Badge>
    );
  };

  const FieldStatusBadge = ({ field, filled }: { field: string; filled: boolean }) => {
    const isManuallyValidated = manualValidations[field];

    if (filled) {
      return (
        <Badge className={cn(badgeStyles.filled, badgeBase.sizeCompact, badgeBase.withIcon, "ml-2")}>
          <CheckCircle2 className={badgeBase.iconSizeCompact} />
          Renseigné
        </Badge>
      );
    }

    if (isManuallyValidated) {
      return (
        <Badge
          className={cn("ml-2 cursor-pointer bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20", badgeBase.sizeCompact, badgeBase.withIcon)}
          onClick={() => handleManualValidation(field, false)}
        >
          <Check className={badgeBase.iconSizeCompact} />
          Validé manuellement
        </Badge>
      );
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Badge className={cn(badgeStyles.missing, badgeBase.sizeCompact, badgeBase.withIcon, "ml-2 cursor-pointer hover:brightness-95")}>
            <AlertCircle className={badgeBase.iconSizeCompact} />
            Non renseigné
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-3">
            <p className="text-sm font-medium">Champ non renseigné</p>
            <p className="text-xs text-muted-foreground">
              Si ce champ n'est pas applicable à cette formation, vous pouvez le marquer comme valide.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => handleManualValidation(field, true)}
            >
              <Check className="w-3 h-3 mr-1" />
              Marquer comme valide
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const ListField = ({
    fieldKey,
    placeholder,
    label,
  }: {
    fieldKey: keyof FormationFormData;
    placeholder: string;
    label: string;
  }) => {
    const items = (watch(fieldKey) as string[]) || [];

    const handleAdd = () => {
      setValue(fieldKey, [...items, ""] as never, { shouldDirty: true });
    };

    const handleRemove = (index: number) => {
      const newItems = items.filter((_, i) => i !== index);
      setValue(fieldKey, newItems as never, { shouldDirty: true });
    };

    const handleChange = (index: number, value: string) => {
      const newItems = [...items];
      newItems[index] = value;
      setValue(fieldKey, newItems as never, { shouldDirty: true });
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center">
          <Label>{label}</Label>
          <FieldStatusBadge field={fieldKey} filled={items.length > 0 && items.some(v => v.trim() !== "")} />
        </div>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={placeholder}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>
    );
  };

  const NestedListField = ({
    nestedKey,
    placeholder,
    label,
    fieldKey,
  }: {
    nestedKey: "methodes" | "moyens" | "evaluation";
    placeholder: string;
    label: string;
    fieldKey: string;
  }) => {
    const modalites = watch("modalites") || { methodes: [], moyens: [], evaluation: [] };
    const items = modalites[nestedKey] || [];

    const handleAdd = () => {
      setValue(`modalites.${nestedKey}`, [...items, ""], { shouldDirty: true });
    };

    const handleRemove = (index: number) => {
      const newItems = items.filter((_: string, i: number) => i !== index);
      setValue(`modalites.${nestedKey}`, newItems, { shouldDirty: true });
    };

    const handleChange = (index: number, value: string) => {
      const newItems = [...items];
      newItems[index] = value;
      setValue(`modalites.${nestedKey}`, newItems, { shouldDirty: true });
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center">
          <Label>{label}</Label>
          <FieldStatusBadge field={fieldKey} filled={items.length > 0 && items.some((v: string) => v.trim() !== "")} />
        </div>
        {items.map((item: string, index: number) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={placeholder}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>
    );
  };

  const filteredCategories = categories.filter(
    (cat) => !cat.pole_id || cat.pole_id === formValues.pole
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px]" />
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/formations">
            <Button type="button" variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight">
              {isNew ? "Nouvelle formation" : "Modifier la formation"}
            </h1>
            <ScoreIndicator />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button type="button" variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="flex flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="general" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {CATEGORY_LABELS.general}
                <TabBadge category="general" />
              </TabsTrigger>
              <TabsTrigger value="pratique" className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {CATEGORY_LABELS.pratique}
                <TabBadge category="pratique" />
              </TabsTrigger>
              <TabsTrigger value="objectifs" className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                {CATEGORY_LABELS.objectifs}
                <TabBadge category="objectifs" />
              </TabsTrigger>
              <TabsTrigger value="programme" className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {CATEGORY_LABELS.programme}
                <TabBadge category="programme" />
              </TabsTrigger>
              <TabsTrigger value="modalites" className="flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                {CATEGORY_LABELS.modalites}
                <TabBadge category="modalites" />
              </TabsTrigger>
              <TabsTrigger value="indicateurs" className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                {CATEGORY_LABELS.indicateurs}
                <TabBadge category="indicateurs" />
              </TabsTrigger>
              {formValues.pole === "sante" && (
                <TabsTrigger value="bibliographie" className="flex items-center gap-1.5">
                  <Library className="h-3.5 w-3.5" />
                  {CATEGORY_LABELS.bibliographie}
                  <TabBadge category="bibliographie" />
                </TabsTrigger>
              )}
            </TabsList>

            {/* TAB: Général */}
            <TabsContent value="general" className="space-y-4">
              <Card className="border-0 bg-secondary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label>Titre *</Label>
                      <FieldStatusBadge field="title" filled={!!formValues.title} />
                    </div>
                    <Input
                      {...register("title")}
                      onBlur={(e) => {
                        if (!formValues.slug && e.target.value) {
                          setValue("slug", generateSlug(e.target.value));
                        }
                      }}
                    />
                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label>Sous-titre</Label>
                      <FieldStatusBadge field="subtitle" filled={!!formValues.subtitle} />
                    </div>
                    <Input {...register("subtitle")} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label>Description</Label>
                      <FieldStatusBadge field="description" filled={!!formValues.description} />
                    </div>
                    <Textarea {...register("description")} rows={4} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label>Pôle *</Label>
                        <FieldStatusBadge field="pole" filled={!!formValues.pole} />
                      </div>
                      <Select
                        value={formValues.pole}
                        onValueChange={(value) => {
                          const pole = poles.find((p) => p.id === value);
                          setValue("pole", value);
                          setValue("pole_name", pole?.name || "");
                          setValue("category_id", null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {poles.map((pole) => (
                            <SelectItem key={pole.id} value={pole.id}>{pole.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label>Catégorie</Label>
                        <FieldStatusBadge field="category_id" filled={!!formValues.category_id} />
                      </div>
                      <Select
                        value={formValues.category_id || ""}
                        onValueChange={(value) => setValue("category_id", value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Aucune</SelectItem>
                          {filteredCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isNew && (
                <Card className="border-0 bg-secondary/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-base">Sessions de formation</CardTitle>
                      <CardDescription>Gérez les sessions pour cette formation</CardDescription>
                    </div>
                    <Link href={`/admin/sessions/new?formation=${id}`}>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter une session
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {loadingSessions ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p>Aucune session planifiée</p>
                        <Link href={`/admin/sessions/new?formation=${id}`}>
                          <Button type="button" variant="link" className="text-primary">
                            Créer la première session
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Lieu</TableHead>
                            <TableHead>Places</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sessions.map((session) => (
                            <TableRow key={session.id}>
                              <TableCell>
                                {new Date(session.start_date).toLocaleDateString("fr-FR")}
                              </TableCell>
                              <TableCell>{session.lieu || "-"}</TableCell>
                              <TableCell>{session.places_disponibles}/{session.places_max}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{session.status}</Badge>
                              </TableCell>
                              <TableCell>
                                <Link href={`/admin/sessions/${session.id}`}>
                                  <Button type="button" variant="ghost" size="sm">Voir</Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TAB: Pratique */}
            <TabsContent value="pratique" className="space-y-4">
              <Card className="border-0 bg-secondary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Durée et tarifs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label>Durée *</Label>
                      <FieldStatusBadge field="duration" filled={!!formValues.duration} />
                    </div>
                    <Input {...register("duration")} placeholder="ex: 14h (2 jours)" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label>Prix Intra</Label>
                        <FieldStatusBadge field="price_intra_value" filled={!!formValues.price_intra_value} />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          {...register("price_intra_value", { valueAsNumber: true })}
                          placeholder="0"
                          className="w-24"
                        />
                        <Select
                          value={formValues.price_intra_unit}
                          onValueChange={(v) => setValue("price_intra_unit", v)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priceIntraUnits.map((u) => (
                              <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label>Prix Inter</Label>
                        <FieldStatusBadge field="price_inter_value" filled={!!formValues.price_inter_value} />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          {...register("price_inter_value", { valueAsNumber: true })}
                          placeholder="0"
                          className="w-24"
                        />
                        <Select
                          value={formValues.price_inter_unit}
                          onValueChange={(v) => setValue("price_inter_unit", v)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priceInterUnits.map((u) => (
                              <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label>Nombre de participants</Label>
                        <FieldStatusBadge field="nombre_participants" filled={!!formValues.nombre_participants} />
                      </div>
                      <Input {...register("nombre_participants")} placeholder="ex: 4 à 10" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label>Format / Lieu</Label>
                        <FieldStatusBadge field="format_lieu" filled={!!formValues.format_lieu} />
                      </div>
                      <Input {...register("format_lieu")} placeholder="Présentiel, Distanciel..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label>Délai d'accès</Label>
                        <FieldStatusBadge field="delai_acces" filled={!!formValues.delai_acces} />
                      </div>
                      <Input {...register("delai_acces")} placeholder="ex: 15 jours" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label>Certification</Label>
                        <FieldStatusBadge field="certification" filled={!!formValues.certification} />
                      </div>
                      <Input {...register("certification")} placeholder="Certification obtenue" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-secondary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Public et prérequis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ListField fieldKey="prerequis" placeholder="Prérequis..." label="Prérequis" />
                  <ListField fieldKey="public_vise" placeholder="Public visé..." label="Public visé" />
                  <ListField fieldKey="financement" placeholder="Financement possible..." label="Financement" />

                  <div className="space-y-2">
                    <Label>Modalités de paiement</Label>
                    <Textarea {...register("modalites_paiement")} rows={2} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Objectifs */}
            <TabsContent value="objectifs" className="space-y-4">
              <Card className="border-0 bg-secondary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Objectifs pédagogiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ListField fieldKey="objectifs_generaux" placeholder="Objectif général..." label="Objectifs généraux" />
                  <ListField fieldKey="objectifs_operationnels" placeholder="Objectif opérationnel..." label="Objectifs opérationnels" />
                  <ListField fieldKey="competences_visees" placeholder="Compétence..." label="Compétences visées" />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Programme */}
            <TabsContent value="programme" className="space-y-4">
              <Card className="border-0 bg-secondary/30">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base">Programme de formation</CardTitle>
                    <CardDescription>Organisez le contenu en modules</CardDescription>
                  </div>
                  <FieldStatusBadge field="programme" filled={programmeFields.length > 0} />
                </CardHeader>
                <CardContent className="space-y-4">
                  {programmeFields.map((field, index) => (
                    <Card key={field.id} className="border bg-background">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Input
                            {...register(`programme.${index}.title`)}
                            placeholder="Titre du module"
                            className="text-base font-medium border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProgramme(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(watch(`programme.${index}.items`) || []).map((item: string, itemIndex: number) => (
                          <div key={itemIndex} className="flex gap-2">
                            <Input
                              value={item}
                              onChange={(e) => {
                                const items = watch(`programme.${index}.items`) || [];
                                const newItems = [...items];
                                newItems[itemIndex] = e.target.value;
                                setValue(`programme.${index}.items`, newItems);
                              }}
                              placeholder="Contenu..."
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const items = watch(`programme.${index}.items`) || [];
                                setValue(`programme.${index}.items`, items.filter((_: string, i: number) => i !== itemIndex));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const items = watch(`programme.${index}.items`) || [];
                            setValue(`programme.${index}.items`, [...items, ""]);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter un contenu
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendProgramme({ title: "", items: [] })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un module
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Modalités */}
            <TabsContent value="modalites" className="space-y-4">
              <Card className="border-0 bg-secondary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Méthodes et moyens pédagogiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <NestedListField nestedKey="methodes" placeholder="Méthode..." label="Méthodes pédagogiques" fieldKey="modalites.methodes" />
                  <NestedListField nestedKey="moyens" placeholder="Moyen..." label="Moyens techniques et pédagogiques" fieldKey="modalites.moyens" />

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label>Encadrement pédagogique</Label>
                      <FieldStatusBadge field="encadrement_pedagogique" filled={!!formValues.encadrement_pedagogique} />
                    </div>
                    <Textarea {...register("encadrement_pedagogique")} rows={3} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label>Accessibilité</Label>
                      <FieldStatusBadge field="accessibilite" filled={!!formValues.accessibilite} />
                    </div>
                    <Textarea {...register("accessibilite")} rows={2} placeholder="Information sur l'accessibilité aux personnes en situation de handicap..." />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Indicateurs */}
            <TabsContent value="indicateurs" className="space-y-4">
              <Card className="border-0 bg-secondary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Évaluation et indicateurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <NestedListField nestedKey="evaluation" placeholder="Méthode d'évaluation..." label="Méthodes d'évaluation" fieldKey="modalites.evaluation" />

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label>Lien objectifs / évaluation</Label>
                      <FieldStatusBadge field="lien_objectifs_evaluation" filled={!!formValues.lien_objectifs_evaluation} />
                    </div>
                    <Textarea {...register("lien_objectifs_evaluation")} rows={3} />
                  </div>

                  <ListField fieldKey="resultats_attendus" placeholder="Résultat..." label="Résultats attendus" />
                  <ListField fieldKey="indicateurs_reussite" placeholder="Indicateur..." label="Indicateurs de réussite" />
                  <ListField fieldKey="tracabilite" placeholder="Élément de traçabilité..." label="Traçabilité et validation" />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: Bibliographie (Santé only) */}
            {formValues.pole === "sante" && (
              <TabsContent value="bibliographie" className="space-y-4">
                <Card className="border-0 bg-secondary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Bibliographie scientifique</CardTitle>
                    <CardDescription>Références pour le pôle Santé</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Label className="text-sm font-medium">Ouvrages de référence</Label>
                          <FieldStatusBadge
                            field="bibliographie_ouvrages"
                            filled={(formValues.bibliographie?.ouvrages?.length || 0) > 0}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const current = formValues.bibliographie || { ouvrages: [], articles: [] };
                            setValue("bibliographie", {
                              ...current,
                              ouvrages: [...(current.ouvrages || []), { auteurs: "", titre: "", annee: "", source: "" }]
                            });
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter
                        </Button>
                      </div>
                      {(formValues.bibliographie?.ouvrages || []).map((_, index) => (
                        <Card key={index} className="border bg-background">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <Input
                                  {...register(`bibliographie.ouvrages.${index}.auteurs`)}
                                  placeholder="Auteurs"
                                />
                                <Input
                                  {...register(`bibliographie.ouvrages.${index}.annee`)}
                                  placeholder="Année"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const current = formValues.bibliographie || { ouvrages: [], articles: [] };
                                  setValue("bibliographie", {
                                    ...current,
                                    ouvrages: current.ouvrages.filter((_, i) => i !== index)
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              {...register(`bibliographie.ouvrages.${index}.titre`)}
                              placeholder="Titre de l'ouvrage"
                            />
                            <Input
                              {...register(`bibliographie.ouvrages.${index}.source`)}
                              placeholder="Éditeur / Source"
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Label className="text-sm font-medium">Articles scientifiques</Label>
                          <FieldStatusBadge
                            field="bibliographie_articles"
                            filled={(formValues.bibliographie?.articles?.length || 0) > 0}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const current = formValues.bibliographie || { ouvrages: [], articles: [] };
                            setValue("bibliographie", {
                              ...current,
                              articles: [...(current.articles || []), { auteurs: "", titre: "", annee: "", source: "", doi: "" }]
                            });
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter
                        </Button>
                      </div>
                      {(formValues.bibliographie?.articles || []).map((_, index) => (
                        <Card key={index} className="border bg-background">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <Input
                                  {...register(`bibliographie.articles.${index}.auteurs`)}
                                  placeholder="Auteurs"
                                />
                                <Input
                                  {...register(`bibliographie.articles.${index}.annee`)}
                                  placeholder="Année"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const current = formValues.bibliographie || { ouvrages: [], articles: [] };
                                  setValue("bibliographie", {
                                    ...current,
                                    articles: current.articles.filter((_, i) => i !== index)
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              {...register(`bibliographie.articles.${index}.titre`)}
                              placeholder="Titre de l'article"
                            />
                            <Input
                              {...register(`bibliographie.articles.${index}.source`)}
                              placeholder="Revue / Volume / Pages"
                            />
                            <Input
                              {...register(`bibliographie.articles.${index}.doi`)}
                              placeholder="DOI (optionnel)"
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Publication */}
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Publication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Formation active</Label>
                <Switch
                  id="active"
                  checked={formValues.active}
                  onCheckedChange={(checked) => setValue("active", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="popular">Populaire</Label>
                <Switch
                  id="popular"
                  checked={formValues.popular}
                  onCheckedChange={(checked) => setValue("popular", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom Fields */}
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Champs personnalisés</CardTitle>
              <CardDescription>Ajoutez des informations spécifiques</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {customFieldsFields.map((field, index) => (
                <div key={field.id} className="p-3 rounded-lg bg-background space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      {...register(`custom_fields.${index}.name`)}
                      placeholder="Nom du champ"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomField(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={watch(`custom_fields.${index}.type`)}
                      onValueChange={(v) => setValue(`custom_fields.${index}.type`, v as "text" | "number" | "list")}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texte</SelectItem>
                        <SelectItem value="number">Nombre</SelectItem>
                        <SelectItem value="list">Liste</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      {...register(`custom_fields.${index}.value`)}
                      placeholder="Valeur"
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => appendCustomField({ id: crypto.randomUUID(), name: "", value: "", type: "text" })}
              >
                <Plus className="mr-2 h-3 w-3" />
                Ajouter un champ
              </Button>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Organisme</CardTitle>
              <CardDescription>Organisme gestionnaire</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={formValues.organization_id || ""}
                onValueChange={(value) => setValue("organization_id", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center gap-2">
                        {org.logo_url ? (
                          <img src={org.logo_url} alt="" className="h-5 w-5 object-contain rounded" />
                        ) : (
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        )}
                        {org.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* URL & Identifiers */}
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">URL & Identifiants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">Identifiant *</Label>
                <Input id="id" {...register("id")} disabled={!isNew} className="font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" {...register("slug")} className="font-mono text-xs" />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  {...register("image_url")}
                  placeholder="URL de l'image"
                />
                {formValues.image_url && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={formValues.image_url}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta title</Label>
                <Input {...register("meta_title")} placeholder="Titre SEO" />
              </div>
              <div className="space-y-2">
                <Label>Meta description</Label>
                <Textarea {...register("meta_description")} rows={2} placeholder="Description SEO" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette formation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les sessions associées seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
