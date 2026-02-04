"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type NeedsAnalysisTemplate } from "@/hooks/admin/useNeedsAnalysisTemplates";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Plus,
  X,
  Mail,
  User,
  Loader2,
  Copy,
  Link2,
  CheckCircle2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: NeedsAnalysisTemplate | null;
  templates?: NeedsAnalysisTemplate[];
}

interface Recipient {
  id: string;
  name: string;
  email: string;
}

type SendMethod = "email" | "link";

export function SendEmailDialog({ open, onOpenChange, template, templates }: SendEmailDialogProps) {
  const [sendMethod, setSendMethod] = useState<SendMethod>("email");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(template?.id || "");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: uuidv4(), name: "", email: "" },
  ]);
  const [emailSubject, setEmailSubject] = useState(
    template ? `Questionnaire: ${template.name}` : "Questionnaire d'analyse des besoins"
  );
  const [emailMessage, setEmailMessage] = useState(
    `Bonjour,

Nous vous invitons à remplir ce questionnaire d'analyse des besoins afin de mieux comprendre vos attentes et personnaliser notre offre de formation.

Cliquez sur le lien ci-dessous pour accéder au questionnaire.

Cordialement,
L'équipe C&CO Formation`
  );
  const [expirationDays, setExpirationDays] = useState("30");
  const [isSending, setIsSending] = useState(false);
  const [generatedLinks, setGeneratedLinks] = useState<{ name: string; link: string }[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get the currently selected template
  const currentTemplate = templates?.find(t => t.id === selectedTemplateId) || template;

  const resetState = () => {
    setRecipients([{ id: uuidv4(), name: "", email: "" }]);
    setGeneratedLinks([]);
    setShowSuccess(false);
    setSelectedTemplateId(template?.id || templates?.[0]?.id || "");
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const addRecipient = () => {
    setRecipients([...recipients, { id: uuidv4(), name: "", email: "" }]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length <= 1) return;
    setRecipients(recipients.filter((r) => r.id !== id));
  };

  const updateRecipient = (id: string, field: "name" | "email", value: string) => {
    setRecipients(
      recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const validateRecipients = () => {
    const validRecipients = recipients.filter((r) => r.email.trim());
    if (validRecipients.length === 0) {
      toast.error("Ajoutez au moins un destinataire avec une adresse email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const r of validRecipients) {
      if (!emailRegex.test(r.email)) {
        toast.error(`Email invalide: ${r.email}`);
        return false;
      }
    }

    return true;
  };

  const generateMagicToken = () => {
    return uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "").slice(0, 16);
  };

  const handleSend = async () => {
    if (!currentTemplate) return;
    if (!validateRecipients()) return;

    setIsSending(true);

    try {
      const supabase = createClient();
      const validRecipients = recipients.filter((r) => r.email.trim());
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expirationDays));

      const links: { name: string; link: string }[] = [];

      for (const recipient of validRecipients) {
        const token = generateMagicToken();

        // Create the magic link record in database
        const { error: insertError } = await supabase
          .from("needs_analysis_invitations")
          .insert({
            id: uuidv4(),
            template_id: currentTemplate.id,
            token,
            recipient_name: recipient.name || null,
            recipient_email: recipient.email,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Error creating invitation:", insertError);
          // Try to continue with other recipients
        }

        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const link = `${baseUrl}/questionnaire/${token}`;
        links.push({ name: recipient.name || recipient.email, link });

        // If email method, send the email
        if (sendMethod === "email") {
          try {
            await fetch("/api/admin/analyse-besoins/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: recipient.email,
                name: recipient.name,
                subject: emailSubject,
                message: emailMessage,
                link,
                templateName: currentTemplate.name,
              }),
            });
          } catch (emailError) {
            console.error("Error sending email:", emailError);
          }
        }
      }

      setGeneratedLinks(links);
      setShowSuccess(true);

      if (sendMethod === "email") {
        toast.success(`${validRecipients.length} email(s) envoyé(s)`);
      } else {
        toast.success(`${validRecipients.length} lien(s) généré(s)`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Lien copié");
    } catch {
      toast.error("Erreur lors de la copie");
    }
  };

  const copyAllLinks = async () => {
    try {
      const text = generatedLinks.map((l) => `${l.name}: ${l.link}`).join("\n");
      await navigator.clipboard.writeText(text);
      toast.success("Tous les liens copiés");
    } catch {
      toast.error("Erreur lors de la copie");
    }
  };

  // Show nothing if no template selected and no templates available
  if (!currentTemplate && (!templates || templates.length === 0)) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Envoyer le questionnaire
          </DialogTitle>
          <DialogDescription>
            {currentTemplate
              ? `Envoyez "${currentTemplate.name}" par email ou générez des liens`
              : "Sélectionnez un questionnaire à envoyer"}
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex-1 py-8">
            <div className="text-center space-y-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-lg">
                  {sendMethod === "email" ? "Emails envoyés !" : "Liens générés !"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {generatedLinks.length} destinataire(s)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Liens magiques générés</Label>
                <Button variant="outline" size="sm" onClick={copyAllLinks}>
                  <Copy className="h-4 w-4 mr-2" />
                  Tout copier
                </Button>
              </div>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {generatedLinks.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.link}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => copyLink(item.link)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Template Selector - shown when multiple templates available */}
              {templates && templates.length > 0 && (
                <div className="space-y-2">
                  <Label>Questionnaire à envoyer</Label>
                  <Select
                    value={selectedTemplateId}
                    onValueChange={(value) => {
                      setSelectedTemplateId(value);
                      const newTemplate = templates.find(t => t.id === value);
                      if (newTemplate) {
                        setEmailSubject(`Questionnaire: ${newTemplate.name}`);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un questionnaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter(t => t.active).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Send Method */}
              <div className="space-y-2">
                <Label>Méthode d'envoi</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={sendMethod === "email" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setSendMethod("email")}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Par email
                  </Button>
                  <Button
                    variant={sendMethod === "link" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setSendMethod("link")}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Générer liens
                  </Button>
                </div>
              </div>

              {/* Recipients */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Destinataires</Label>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {recipients.filter((r) => r.email.trim()).length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {recipients.map((recipient, index) => (
                    <div key={recipient.id} className="flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={recipient.name}
                            onChange={(e) => updateRecipient(recipient.id, "name", e.target.value)}
                            placeholder="Nom (optionnel)"
                            className="pl-10"
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            value={recipient.email}
                            onChange={(e) => updateRecipient(recipient.id, "email", e.target.value)}
                            placeholder="email@exemple.com"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 flex-shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeRecipient(recipient.id)}
                        disabled={recipients.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed"
                  onClick={addRecipient}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un destinataire
                </Button>
              </div>

              {/* Email customization (only for email method) */}
              {sendMethod === "email" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Objet de l'email</Label>
                    <Input
                      id="subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Objet..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      placeholder="Message..."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Le lien vers le questionnaire sera ajouté automatiquement
                    </p>
                  </div>
                </>
              )}

              {/* Expiration */}
              <div className="space-y-2">
                <Label>Expiration du lien</Label>
                <Select value={expirationDays} onValueChange={setExpirationDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 jours</SelectItem>
                    <SelectItem value="14">14 jours</SelectItem>
                    <SelectItem value="30">30 jours</SelectItem>
                    <SelectItem value="60">60 jours</SelectItem>
                    <SelectItem value="90">90 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          {showSuccess ? (
            <Button onClick={handleClose}>Terminé</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={handleSend} disabled={isSending}>
                {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {sendMethod === "email" ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Générer les liens
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
