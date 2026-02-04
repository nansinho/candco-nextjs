import { Suspense } from "react";
import { AuthClient } from "./AuthClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Connexion",
  description: "Connectez-vous ou créez votre compte C&Co Formation",
};

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthClient />
    </Suspense>
  );
}
