import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployeeForm } from "@/components/modules/employees/employee-form";
import { ROUTES } from "@/lib/utils/url";

export default async function EmployeesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userData } = await supabase
    .from("User")
    .select("role")
    .eq("email", user.email)
    .single();

  if (userData?.role !== "ADMIN") {
    redirect(ROUTES.USER.DASHBOARD);
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Employee Management</h1>
      <div className="max-w-2xl">
        <EmployeeForm />
      </div>
    </div>
  );
}
