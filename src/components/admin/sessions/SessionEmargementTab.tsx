"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  GraduationCap,
  CheckCircle,
  XCircle,
  Circle,
  Lock,
  Unlock,
  PenTool,
  Loader2,
} from "lucide-react";
import { format, parseISO, isToday, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import {
  useSessionPresence,
  useMarkPresence,
  generateCreneaux,
  type Creneau,
  type PresenceRecord,
  type InscriptionForPresence,
  type SessionForCreneaux,
} from "@/hooks/admin/useSessionPresence";

interface SessionEmargementTabProps {
  sessionId: string;
  session: SessionForCreneaux & {
    format_type: string | null;
    formateurs?: { prenom: string; nom: string } | null;
  };
}

type PresenceStatus = "present" | "absent" | "non_pointe";

interface LearnerPresenceRow {
  inscription: InscriptionForPresence;
  presence: PresenceRecord | null;
  status: PresenceStatus;
}

function getPresenceStatus(presence: PresenceRecord | null): PresenceStatus {
  if (!presence || presence.present === null) return "non_pointe";
  return presence.present ? "present" : "absent";
}

// Sort: present first, absent second, non_pointe last
const statusOrder: Record<PresenceStatus, number> = {
  present: 0,
  absent: 1,
  non_pointe: 2,
};

function StatusIcon({ status }: { status: PresenceStatus }) {
  switch (status) {
    case "present":
      return <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />;
    case "absent":
      return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
    case "non_pointe":
      return <Circle className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
}

function StatusDot({ color }: { color: string }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

export function SessionEmargementTab({ sessionId, session }: SessionEmargementTabProps) {
  const { data, isLoading } = useSessionPresence(sessionId);
  const markPresence = useMarkPresence();

  const creneaux = useMemo(() => generateCreneaux(session), [session]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const presences = data?.presences ?? [];
  const inscriptions = data?.inscriptions ?? [];

  if (inscriptions.length === 0) {
    return (
      <Card className="border-0 bg-secondary/30">
        <CardContent className="py-12 text-center">
          <Circle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Aucun participant inscrit pour cette session</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {creneaux.map((creneau) => (
        <CreneauBlock
          key={`${creneau.date}-${creneau.type}`}
          creneau={creneau}
          inscriptions={inscriptions}
          presences={presences}
          session={session}
          sessionId={sessionId}
          markPresence={markPresence}
        />
      ))}
    </div>
  );
}

interface CreneauBlockProps {
  creneau: Creneau;
  inscriptions: InscriptionForPresence[];
  presences: PresenceRecord[];
  session: SessionEmargementTabProps["session"];
  sessionId: string;
  markPresence: ReturnType<typeof useMarkPresence>;
}

function CreneauBlock({
  creneau,
  inscriptions,
  presences,
  session,
  sessionId,
  markPresence,
}: CreneauBlockProps) {
  // Build learner rows for this créneau
  const rows: LearnerPresenceRow[] = useMemo(() => {
    const learners = inscriptions.map((inscription) => {
      const presence = presences.find(
        (p) => p.inscription_id === inscription.id && p.date === creneau.date
      ) ?? null;
      return {
        inscription,
        presence,
        status: getPresenceStatus(presence),
      };
    });

    // Sort: present → absent → non_pointe, then alphabetically by nom
    return learners.sort((a, b) => {
      const orderDiff = statusOrder[a.status] - statusOrder[b.status];
      if (orderDiff !== 0) return orderDiff;
      return (a.inscription.nom ?? "").localeCompare(b.inscription.nom ?? "");
    });
  }, [inscriptions, presences, creneau.date]);

  const presentCount = rows.filter((r) => r.status === "present").length;
  const absentCount = rows.filter((r) => r.status === "absent").length;
  const nonPointeCount = rows.filter((r) => r.status === "non_pointe").length;
  const total = rows.length;

  const creneauDate = parseISO(creneau.date);
  const isClosed = isPast(creneauDate) && !isToday(creneauDate);
  const formatLabel = session.format_type === "distanciel" ? "Distanciel" : "Pr\u00e9sentiel";
  const formateurName = session.formateurs
    ? `${session.formateurs.prenom} ${session.formateurs.nom}`
    : null;

  return (
    <Card className="border-0 bg-secondary/30 overflow-hidden">
      {/* Créneau Header */}
      <div className="px-4 py-3 border-b border-border/40">
        {/* Row 1: Date, time, status */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {format(creneauDate, "EEEE d MMMM yyyy", { locale: fr })}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {creneau.heure_debut} \u2013 {creneau.heure_fin}
            </span>
          </div>
          <Badge
            variant="outline"
            className={
              isClosed
                ? "bg-muted text-muted-foreground border-border/30"
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            }
          >
            {isClosed ? (
              <><Lock className="h-3 w-3 mr-1" />Ferm\u00e9</>
            ) : (
              <><Unlock className="h-3 w-3 mr-1" />Ouvert</>
            )}
          </Badge>
        </div>

        {/* Row 2: Formateur + format + summary */}
        <div className="flex items-center justify-between gap-3 mt-1.5 flex-wrap">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {formateurName && (
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {formateurName}
              </span>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-orange-500/10 text-orange-600 border-orange-500/20">
              {formatLabel}
            </Badge>
          </div>

          {/* Compact summary counters */}
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1">
              <StatusDot color="bg-emerald-500" />
              {presentCount}/{total}
            </span>
            <span className="flex items-center gap-1">
              <StatusDot color="bg-red-500" />
              {absentCount}
            </span>
            <span className="flex items-center gap-1">
              <StatusDot color="bg-muted-foreground/40" />
              {nonPointeCount}
            </span>
          </div>
        </div>
      </div>

      {/* Learner Rows */}
      <CardContent className="p-0">
        {rows.map((row) => (
          <LearnerRow
            key={row.inscription.id}
            row={row}
            creneau={creneau}
            sessionId={sessionId}
            markPresence={markPresence}
            isClosed={isClosed}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface LearnerRowProps {
  row: LearnerPresenceRow;
  creneau: Creneau;
  sessionId: string;
  markPresence: ReturnType<typeof useMarkPresence>;
  isClosed: boolean;
}

function LearnerRow({ row, creneau, sessionId, markPresence, isClosed }: LearnerRowProps) {
  const { inscription, presence, status } = row;
  const fullName = `${inscription.prenom ?? ""} ${inscription.nom ?? ""}`.trim();

  const handleMark = (present: boolean) => {
    markPresence.mutate({
      sessionId,
      inscriptionId: inscription.id,
      date: creneau.date,
      present,
    });
  };

  const signatureTime = presence?.updated_at
    ? format(parseISO(presence.updated_at), "HH:mm")
    : null;

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 border-b border-border/20 last:border-b-0 hover:bg-secondary/40 transition-colors">
      {/* Status icon */}
      <StatusIcon status={status} />

      {/* Name (dominant) + email small */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{fullName || "Sans nom"}</p>
        {inscription.email && (
          <p className="text-[11px] text-muted-foreground truncate">{inscription.email}</p>
        )}
      </div>

      {/* Signature indicator */}
      {presence?.signature_apprenant && (
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
          <PenTool className="h-3 w-3" />
          sign\u00e9
        </span>
      )}

      {/* Timestamp */}
      {status !== "non_pointe" && signatureTime && (
        <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
          {signatureTime}
        </span>
      )}

      {/* Action buttons */}
      {!isClosed && (
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant={status === "present" ? "default" : "outline"}
            size="sm"
            className={`h-6 px-2 text-[11px] ${
              status === "present"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                : "text-muted-foreground hover:text-emerald-600 hover:border-emerald-300"
            }`}
            onClick={() => handleMark(true)}
            disabled={markPresence.isPending}
          >
            Pr\u00e9sent
          </Button>
          <Button
            variant={status === "absent" ? "default" : "outline"}
            size="sm"
            className={`h-6 px-2 text-[11px] ${
              status === "absent"
                ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                : "text-muted-foreground hover:text-red-600 hover:border-red-300"
            }`}
            onClick={() => handleMark(false)}
            disabled={markPresence.isPending}
          >
            Absent
          </Button>
        </div>
      )}
    </div>
  );
}
