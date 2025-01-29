// src/components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import { ROUTES } from "@/lib/utils/url";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const supabase = createClient();
      const {
        error: signInError,
        data: { user },
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Obtener el perfil desde Supabase en lugar de Prisma
      const { data: userData } = await supabase
        .from("User")
        .select("role")
        .eq("email", user?.email)
        .single();

      // Redirigir basado en el rol del usuario
      if (userData?.role === "ADMIN") {
        router.push(ROUTES.ADMIN.DASHBOARD);
      } else {
        router.push(ROUTES.USER.DASHBOARD);
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Invalid login credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center gap-2">
            <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Authenticating...</p>
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div
            role="alert"
            className="p-4 mb-4 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email Address
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Password
            </label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <Button className="w-full" type="submit" disabled={isLoading}>
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
