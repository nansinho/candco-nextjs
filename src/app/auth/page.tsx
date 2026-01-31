import { Suspense } from "react";
import { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { AuthClient } from "./AuthClient";

export const metadata: Metadata = {
  title: "Connexion | C&Co Formation",
  description:
    "Connectez-vous à votre espace personnel C&Co Formation. Accédez à vos formations, vos attestations et votre historique de formation.",
  robots: {
    index: false,
    follow: false,
  },
};

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
