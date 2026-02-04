"use client";

/**
 * @file Auth page - Redesigned
 * @description Page d'authentification premium avec split-screen layout
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CiviliteSelect } from "@/components/ui/CiviliteSelect";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { IconCaptcha } from "@/components/captcha";
import {
  Loader2,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// Schémas de validation
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide").max(255),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

const signUpSchema = z
  .object({
    civilite: z.enum(["Mme", "M."], { message: "Veuillez sélectionner votre civilité" }),
    email: z.string().email("Adresse email invalide").max(255),
    password: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[A-Z]/, "Une majuscule requise")
      .regex(/[a-z]/, "Une minuscule requise")
      .regex(/[0-9]/, "Un chiffre requis"),
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(50),
    lastName: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide").max(255),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[A-Z]/, "Une majuscule requise")
      .regex(/[a-z]/, "Une minuscule requise")
      .regex(/[0-9]/, "Un chiffre requis"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type AuthMode = "login" | "signup" | "forgot" | "reset" | "reset-success";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export function AuthClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [forgotCaptchaValid, setForgotCaptchaValid] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const urlMode = searchParams.get("mode");
  const urlToken = searchParams.get("token") || "";
  const urlEmail = searchParams.get("email") || "";
  const urlFirstName = searchParams.get("firstName") || "";
  const urlLastName = searchParams.get("lastName") || "";
  const urlRedirect = searchParams.get("redirect");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      civilite: undefined,
      email: urlEmail,
      firstName: urlFirstName,
      lastName: urlLastName,
      password: "",
      confirmPassword: "",
    },
  });

  const forgotForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchedPassword = signUpForm.watch("password") || "";
  const watchedResetPassword = resetForm.watch("password") || "";

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && authMode !== "reset") {
        const redirectTo = urlRedirect
          ? decodeURIComponent(urlRedirect)
          : "/mon-compte";
        router.push(redirectTo);
      }
    };
    checkAuth();
  }, [supabase, router, authMode, urlRedirect]);

  // Handle URL mode parameter
  useEffect(() => {
    if (urlMode === "signup") setAuthMode("signup");
    else if (urlMode === "reset") setAuthMode("reset");
    else setAuthMode("login");
  }, [urlMode]);

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      const redirectTo = urlRedirect
        ? decodeURIComponent(urlRedirect)
        : "/mon-compte";
      router.push(redirectTo);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message === "Invalid login credentials"
              ? "Email ou mot de passe incorrect"
              : error.message
            : "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUpSubmit = async (data: SignUpFormData) => {
    if (!captchaValid) {
      setMessage({ type: "error", text: "Veuillez compléter la vérification" });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            civilite: data.civilite,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMessage({
        type: "success",
        text: "Vérifiez votre email pour confirmer votre inscription.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotSubmit = async (data: ForgotPasswordFormData) => {
    if (!forgotCaptchaValid) {
      setMessage({ type: "error", text: "Veuillez compléter la vérification" });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) throw error;
      setMessage({
        type: "success",
        text: "Un email de réinitialisation a été envoyé.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;
      setAuthMode("reset-success");
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = useCallback((mode: AuthMode) => {
    setAuthMode(mode);
    setMessage(null);
    setCaptchaValid(false);
    setForgotCaptchaValid(false);
  }, []);

  const getTitle = () => {
    switch (authMode) {
      case "login":
        return "Connexion";
      case "signup":
        return "Créer un compte";
      case "forgot":
        return "Mot de passe oublié";
      case "reset":
        return "Nouveau mot de passe";
      case "reset-success":
        return "Mot de passe mis à jour";
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case "login":
        return "Accédez à votre espace personnel";
      case "signup":
        return "Rejoignez C&Co Formation";
      case "forgot":
        return "Recevez un lien de réinitialisation";
      case "reset":
        return "Choisissez un nouveau mot de passe sécurisé";
      case "reset-success":
        return "Vous pouvez maintenant vous connecter";
    }
  };

  return (
    <motion.div
      className="min-h-screen flex"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Left Side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <Image
          src="/hero-training.jpg"
          alt="Formation professionnelle"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/80" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour au site</span>
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="mb-8">
                <Image
                  src="/logo.svg"
                  alt="C&Co Formation"
                  width={180}
                  height={60}
                  className="mx-auto invert"
                  priority
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Bienvenue sur C&Co Formation
              </h1>
              <p className="text-white/80 max-w-md mx-auto text-lg">
                Votre partenaire pour des formations professionnelles de qualité
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              className="mt-12 grid gap-4 max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {[
                "Formations certifiantes Qualiopi",
                "Accompagnement personnalisé",
                "Financement OPCO disponible",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-left bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white">{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-white/60">
            © {new Date().getFullYear()} C&Co Formation. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-background">
        {/* Mobile header */}
        <header className="lg:hidden p-4 sm:p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour au site</span>
          </Link>
        </header>

        {/* Form container */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            {/* Logo (mobile only) */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-block">
                <h1 className="text-2xl font-bold">
                  <span className="text-primary">C&Co</span>{" "}
                  <span className="text-foreground">Formation</span>
                </h1>
              </Link>
            </div>

            {/* Card */}
            <motion.div
              className="bg-card/80 backdrop-blur-lg border border-border/30 rounded-2xl shadow-2xl p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={authMode}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Title */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      {getTitle()}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      {getSubtitle()}
                    </p>
                  </div>

                  {/* Message */}
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 ${
                        message.type === "success"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                      }`}
                    >
                      {message.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      )}
                      <span>{message.text}</span>
                    </motion.div>
                  )}

                  {/* Login Form */}
                  {authMode === "login" && (
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="votre@email.com"
                            className="h-12 pl-11 bg-secondary/50 border-border/50 focus:bg-background"
                            {...loginForm.register("email")}
                            disabled={isLoading}
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-xs text-destructive">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="password">Mot de passe</Label>
                          <button
                            type="button"
                            onClick={() => switchMode("forgot")}
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            Oublié ?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 pl-11 pr-11 bg-secondary/50 border-border/50 focus:bg-background"
                            {...loginForm.register("password")}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-xs text-destructive">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          "Se connecter"
                        )}
                      </Button>

                      <p className="text-center text-sm text-muted-foreground">
                        Pas encore de compte ?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("signup")}
                          className="text-primary font-semibold hover:underline"
                        >
                          S&apos;inscrire
                        </button>
                      </p>
                    </form>
                  )}

                  {/* Signup Form */}
                  {authMode === "signup" && (
                    <form
                      onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
                      className="space-y-4"
                    >
                      <CiviliteSelect
                        value={signUpForm.watch("civilite") || ""}
                        onChange={(val) =>
                          signUpForm.setValue("civilite", val as "Mme" | "M.")
                        }
                        error={signUpForm.formState.errors.civilite?.message}
                        required
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="firstName"
                              placeholder="Jean"
                              className="h-12 pl-11 bg-secondary/50 border-border/50 focus:bg-background"
                              {...signUpForm.register("firstName")}
                              disabled={isLoading}
                            />
                          </div>
                          {signUpForm.formState.errors.firstName && (
                            <p className="text-xs text-destructive">
                              {signUpForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom</Label>
                          <Input
                            id="lastName"
                            placeholder="Dupont"
                            className="h-12 bg-secondary/50 border-border/50 focus:bg-background"
                            {...signUpForm.register("lastName")}
                            disabled={isLoading}
                          />
                          {signUpForm.formState.errors.lastName && (
                            <p className="text-xs text-destructive">
                              {signUpForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="votre@email.com"
                            className="h-12 pl-11 bg-secondary/50 border-border/50 focus:bg-background"
                            {...signUpForm.register("email")}
                            disabled={isLoading}
                          />
                        </div>
                        {signUpForm.formState.errors.email && (
                          <p className="text-xs text-destructive">
                            {signUpForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 pl-11 pr-11 bg-secondary/50 border-border/50 focus:bg-background"
                            {...signUpForm.register("password")}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {watchedPassword && (
                          <PasswordStrengthIndicator password={watchedPassword} />
                        )}
                        {signUpForm.formState.errors.password && (
                          <p className="text-xs text-destructive">
                            {signUpForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirmer le mot de passe
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            className="h-12 pl-11 bg-secondary/50 border-border/50 focus:bg-background"
                            {...signUpForm.register("confirmPassword")}
                            disabled={isLoading}
                          />
                        </div>
                        {signUpForm.formState.errors.confirmPassword && (
                          <p className="text-xs text-destructive">
                            {signUpForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <IconCaptcha onVerify={setCaptchaValid} disabled={isLoading} />

                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isLoading || !captchaValid}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          "Créer mon compte"
                        )}
                      </Button>

                      <p className="text-center text-sm text-muted-foreground">
                        Déjà un compte ?{" "}
                        <button
                          type="button"
                          onClick={() => switchMode("login")}
                          className="text-primary font-semibold hover:underline"
                        >
                          Se connecter
                        </button>
                      </p>
                    </form>
                  )}

                  {/* Forgot Password Form */}
                  {authMode === "forgot" && (
                    <form
                      onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="votre@email.com"
                            className="h-12 pl-11 bg-secondary/50 border-border/50 focus:bg-background"
                            {...forgotForm.register("email")}
                            disabled={isLoading}
                          />
                        </div>
                        {forgotForm.formState.errors.email && (
                          <p className="text-xs text-destructive">
                            {forgotForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <IconCaptcha
                        onVerify={setForgotCaptchaValid}
                        disabled={isLoading}
                      />

                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isLoading || !forgotCaptchaValid}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          "Envoyer le lien"
                        )}
                      </Button>

                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                      >
                        Retour à la connexion
                      </button>
                    </form>
                  )}

                  {/* Reset Password Form */}
                  {authMode === "reset" && (
                    <form
                      onSubmit={resetForm.handleSubmit(onResetSubmit)}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nouveau mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="new-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 pl-11 pr-11 bg-secondary/50 border-border/50 focus:bg-background"
                            {...resetForm.register("password")}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {watchedResetPassword && (
                          <PasswordStrengthIndicator password={watchedResetPassword} />
                        )}
                        {resetForm.formState.errors.password && (
                          <p className="text-xs text-destructive">
                            {resetForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-new-password">
                          Confirmer le mot de passe
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirm-new-password"
                            type="password"
                            placeholder="••••••••"
                            className="h-12 pl-11 bg-secondary/50 border-border/50 focus:bg-background"
                            {...resetForm.register("confirmPassword")}
                            disabled={isLoading}
                          />
                        </div>
                        {resetForm.formState.errors.confirmPassword && (
                          <p className="text-xs text-destructive">
                            {resetForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          "Mettre à jour"
                        )}
                      </Button>
                    </form>
                  )}

                  {/* Reset Success */}
                  {authMode === "reset-success" && (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                      <p className="text-muted-foreground">
                        Votre mot de passe a été mis à jour avec succès.
                      </p>
                      <Button
                        onClick={() => switchMode("login")}
                        className="w-full h-12 text-base font-semibold"
                      >
                        Se connecter
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Legal Links */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                En continuant, vous acceptez nos{" "}
                <Link
                  href="/mentions-legales"
                  className="underline hover:text-foreground"
                >
                  conditions d&apos;utilisation
                </Link>{" "}
                et notre{" "}
                <Link
                  href="/confidentialite"
                  className="underline hover:text-foreground"
                >
                  politique de confidentialité
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
}
