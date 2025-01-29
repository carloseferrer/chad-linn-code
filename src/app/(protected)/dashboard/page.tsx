import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TimesheetDashboard } from "@/components/dashboard/TimesheetDashboard";
import { ROUTES } from "@/lib/utils/url";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userData } = await supabase
    .from("User")
    .select("role, firstName")
    .eq("email", user.email)
    .single();

  if (userData?.role === "ADMIN") {
    redirect(ROUTES.ADMIN.DASHBOARD);
  }

  // Obtener las entradas de tiempo del usuario
  const { data: timeEntries } = await supabase
    .from("TimeEntry")
    .select("*")
    .eq("userId", user.id)
    .order("date", { ascending: false });

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bienvenido, {userData?.firstName || user.email}
          </h1>
          <p className="text-muted-foreground">
            Aquí está el resumen de tus registros de tiempo
          </p>
        </div>

        <TimesheetDashboard entries={timeEntries || []} />
      </div>
    </div>
  );
}
