// middleware.ts (en la raíz del proyecto)
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/lib/utils/url";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
  }

  // Verifica si es una ruta de admin
  const isAdminRoute = pathname.startsWith("/admin");

  try {
    // Crea el cliente de supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string) {
            request.cookies.delete(name);
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Si no hay sesión y no es la página de login, redirige a login
    if (!session && pathname !== "/login") {
      return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }

    // Si hay sesión y está en login, redirige al dashboard
    if (session && pathname === "/login") {
      return NextResponse.redirect(new URL(ROUTES.USER.DASHBOARD, request.url));
    }

    if (isAdminRoute) {
      const response = await fetch(
        `${request.nextUrl.origin}/api/auth/check-role`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const { role } = await response.json();

      if (role !== "ADMIN") {
        return NextResponse.redirect(
          new URL(ROUTES.USER.DASHBOARD, request.url)
        );
      }
    }

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
