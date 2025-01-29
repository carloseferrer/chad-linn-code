"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@prisma/client";

// Definimos el tipo de usuario con el rol explícitamente
interface UserData {
  id: string;
  email: string;
  role: UserRole;
}

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        console.log("Auth User:", authUser);

        if (authError) {
          throw authError;
        }

        if (authUser) {
          // Obtener el rol de la tabla User usando el email
          const { data: userData, error: userError } = await supabase
            .from("User") // Nombre exacto de la tabla como está en Supabase
            .select("role, id")
            .eq("email", authUser.email)
            .single();

          console.log("User Role Data:", userData);

          if (userError) {
            throw userError;
          }

          if (userData) {
            const userDataFormatted: UserData = {
              id: userData.id,
              email: authUser.email!,
              role: userData.role,
            };

            console.log("Final User Data:", userDataFormatted);
            setUser(userDataFormatted);
          }
        }
      } catch (error) {
        console.error("Error in getUser:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from("User")
          .select("role, id")
          .eq("email", session.user.email)
          .single();

        if (userData && !error) {
          setUser({
            id: userData.id,
            email: session.user.email!,
            role: userData.role,
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
