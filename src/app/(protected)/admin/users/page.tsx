"use client";

import { useState } from "react";
import { UsersTable } from "@/components/modules/users/users-table";
import { UserModal } from "@/components/modules/users/user-modal";
import { mockUsers } from "@/utils/mock-data";
import { User } from "@/lib/types";

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [users] = useState<User[]>(mockUsers); // Initialize with mock data

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>
      <UsersTable
        users={users}
        onAddUser={handleAddUser}
        onEditUser={handleEditUser}
      />
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
