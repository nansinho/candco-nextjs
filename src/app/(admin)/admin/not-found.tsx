import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <FileQuestion className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-medium mb-2">Page non trouvée</h2>
          <p className="text-sm text-muted-foreground mb-4">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
      </div>
    </div>
  );
}
