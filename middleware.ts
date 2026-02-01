import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session si nécessaire
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Routes admin protégées
  if (pathname.startsWith("/admin")) {
    if (!user) {
      // Rediriger vers /auth avec redirect URL
      const redirectUrl = new URL("/auth", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Vérifier le rôle de l'utilisateur
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const userRole = roleData?.role || "user";
    const adminRoles = ["superadmin", "admin", "org_manager", "moderator"];

    if (!adminRoles.includes(userRole)) {
      // Pas de rôle admin, rediriger vers accueil
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Vérifications spécifiques par route
    const superadminOnlyRoutes = ["/admin/roles", "/admin/security", "/admin/redirects", "/admin/cookies"];
    const adminOnlyRoutes = ["/admin/users", "/admin/settings", "/admin/formateurs"];

    if (superadminOnlyRoutes.some((route) => pathname.startsWith(route))) {
      if (userRole !== "superadmin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
      if (userRole !== "superadmin" && userRole !== "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  // Routes formateur protégées
  if (pathname.startsWith("/formateur")) {
    if (!user) {
      const redirectUrl = new URL("/auth", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Vérifier si l'utilisateur est formateur
    const { data: formateurData } = await supabase
      .from("formateurs")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!formateurData) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Routes admin
    "/admin/:path*",
    // Routes formateur
    "/formateur/:path*",
  ],
};
