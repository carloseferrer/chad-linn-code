import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/utils/url";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const response = await fetch(
    `/api/users?email=${encodeURIComponent(user.email)}`
  );
  const userData = await response.json();

  if (userData.role !== "ADMIN") {
    redirect(ROUTES.USER.DASHBOARD);
  }

  const usersCountResponse = await fetch("/api/users/count");
  const { count: usersCount } = await usersCountResponse.json();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{usersCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Email: {user.email}</p>
            <p>Rol: {userData.role}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
