"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserModal } from "@/components/modules/users/user-modal";
import { useUser } from "@/lib/hooks/use-user";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/utils/url";

export default function EmployeesPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push(ROUTES.USER.DASHBOARD);
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add New Employee</Button>
      </div>

      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
