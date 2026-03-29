import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ role: null, profile: null }, { status: 401 });
    }

    // Single OR query to find user by ID or email
    const supabase = createServiceClient();
    const { data: userData } = await supabase
      .from("utilisateurs")
      .select("role, prenom, nom, avatar_url")
      .or(`id.eq.${user.id}${user.email ? `,email.eq.${user.email}` : ""}`)
      .limit(1)
      .maybeSingle();

    const response = NextResponse.json({
      role: userData?.role || "user",
      profile: userData ? {
        first_name: userData.prenom,
        last_name: userData.nom,
        avatar_url: userData.avatar_url,
      } : null,
    });

    // Cache for 60 seconds (private - per user)
    response.headers.set("Cache-Control", "private, max-age=60");
    return response;
  } catch {
    return NextResponse.json({ role: "user", profile: null }, { status: 500 });
  }
}
