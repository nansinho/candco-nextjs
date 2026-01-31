"use client";

/**
 * @file Auth page
 * @description Page d'authentification avec connexion, inscription, mot de passe oublié
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
    civilite: z.enum(["Mme", "M."], "Veuillez sélectionner votre civilité"),
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

// Simple captcha component
function SimpleCaptcha({
  onVerify,
}: {
  onVerify: (verified: boolean) => void;
}) {
  const [num1] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [num2] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const correctAnswer = num1 + num2;
    onVerify(parseInt(answer) === correctAnswer);
  }, [answer, num1, num2, onVerify]);

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha">
        Vérification : {num1} + {num2} = ?
      </Label>
      <Input
        id="captcha"
        type="number"
        placeholder="Votre réponse"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="w-full"
      />
    </div>
  );
}

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
      if (error) {
        setMessage({
          type: "error",
          text:
            error.message === "Invalid login credentials"
              ? "Email ou mot de passe incorrect"
              : error.message,
        });
        return;
      }
      setMessage({ type: "success", text: "Connexion réussie !" });
      const redirectTo = urlRedirect
        ? decodeURIComponent(urlRedirect)
        : "/mon-compte";
      router.push(redirectTo);
    } catch {
      setMessage({
        type: "error",
        text: "Une erreur inattendue s'est produite",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUpSubmit = async (data: SignUpFormData) => {
    if (!captchaValid) {
      setMessage({
        type: "error",
        text: "Veuillez compléter la vérification de sécurité",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://candco-nextjs.vercel.app";
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            civilite: data.civilite,
            full_name: `${data.firstName} ${data.lastName}`,
          },
        },
      });
      if (error) {
        setMessage({
          type: "error",
          text: error.message.includes("User already registered")
            ? "Cet email est déjà utilisé"
            : error.message,
        });
        return;
      }
      setMessage({
        type: "success",
        text: "Compte créé ! Vérifiez votre email pour confirmer votre inscription.",
      });
      loginForm.setValue("email", data.email);
      setTimeout(() => setAuthMode("login"), 3000);
    } catch {
      setMessage({
        type: "error",
        text: "Une erreur inattendue s'est produite",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotSubmit = async (data: ForgotPasswordFormData) => {
    if (!forgotCaptchaValid) {
      setMessage({
        type: "error",
        text: "Veuillez compléter la vérification de sécurité",
      });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://candco-nextjs.vercel.app";
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${siteUrl}/auth?mode=reset`,
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      setMessage({
        type: "success",
        text: "Si un compte existe, vous recevrez un lien de réinitialisation.",
      });
      setTimeout(() => setAuthMode("login"), 3000);
    } catch {
      setMessage({
        type: "error",
        text: "Une erreur inattendue s'est produite",
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
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      setAuthMode("reset-success");
    } catch {
      setMessage({
        type: "error",
        text: "Une erreur inattendue s'est produite",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = useCallback((mode: AuthMode) => {
    setAuthMode(mode);
    setShowPassword(false);
    setCaptchaValid(false);
    setForgotCaptchaValid(false);
    setMessage(null);
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
        return "Mot de passe modifié";
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
    <div className="min-h-screen flex flex-col overflow-y-auto bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="p-4 sm:p-6 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour au site</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold">
                <span className="text-primary">C&Co</span>{" "}
                <span className="text-foreground">Formation</span>
              </h1>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-card border border-border/30 rounded-xl shadow-lg p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={authMode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Title */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    {getTitle()}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getSubtitle()}
                  </p>
                </div>

                {/* Message */}
                {message && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm ${
                      message.type === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Login Form */}
                {authMode === "login" && (
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          className="pl-10"
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
                          className="text-xs text-primary hover:underline"
                        >
                          Oublié ?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...loginForm.register("password")}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Se connecter"
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Pas encore de compte ?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("signup")}
                        className="text-primary font-medium hover:underline"
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
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="Jean"
                            className="pl-10"
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
                      <Label htmlFor="signupEmail">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signupEmail"
                          type="email"
                          placeholder="votre@email.com"
                          className="pl-10"
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
                      <Label htmlFor="signupPassword">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signupPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...signUpForm.register("password")}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {signUpForm.formState.errors.password && (
                        <p className="text-xs text-destructive">
                          {signUpForm.formState.errors.password.message}
                        </p>
                      )}
                      <PasswordStrengthIndicator password={watchedPassword} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirmer le mot de passe
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10"
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

                    <SimpleCaptcha onVerify={setCaptchaValid} />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !captchaValid}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Créer mon compte"
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      Déjà un compte ?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="text-primary font-medium hover:underline"
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
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="forgotEmail">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="forgotEmail"
                          type="email"
                          placeholder="votre@email.com"
                          className="pl-10"
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

                    <SimpleCaptcha onVerify={setForgotCaptchaValid} />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !forgotCaptchaValid}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
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
                  <>
                    {!urlToken && (
                      <div className="mb-6">
                        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-destructive">
                                Lien invalide ou expiré
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Ce lien de réinitialisation n&apos;est plus
                                valide. Veuillez demander un nouveau lien.
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => switchMode("forgot")}
                        >
                          Demander un nouveau lien
                        </Button>
                      </div>
                    )}

                    {urlToken && (
                      <form
                        onSubmit={resetForm.handleSubmit(onResetSubmit)}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">
                            Nouveau mot de passe
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="newPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10"
                              {...resetForm.register("password")}
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {resetForm.formState.errors.password && (
                            <p className="text-xs text-destructive">
                              {resetForm.formState.errors.password.message}
                            </p>
                          )}
                          <PasswordStrengthIndicator
                            password={watchedResetPassword}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="resetConfirmPassword">
                            Confirmer le mot de passe
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="resetConfirmPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10"
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
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Modifier le mot de passe"
                          )}
                        </Button>
                      </form>
                    )}
                  </>
                )}

                {/* Reset Success */}
                {authMode === "reset-success" && (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-muted-foreground">
                      Votre mot de passe a été modifié avec succès.
                    </p>
                    <Button
                      onClick={() => switchMode("login")}
                      className="w-full"
                    >
                      Se connecter
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
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
        </motion.div>
      </main>
    </div>
  );
}
