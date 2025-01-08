import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  console.log(userData);

  if (userData?.role === "ADMIN") {
    redirect(ROUTES.ADMIN.DASHBOARD);
  }

  return (
    <div className="container py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Email: {user.email}</p>
            <p>Nombre: {userData?.firstName || "No especificado"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
