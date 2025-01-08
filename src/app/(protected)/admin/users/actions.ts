"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/utils";

export async function createUser(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: "ADMIN" | "USER";
}) {
  const admin = await requireAdmin();
  const supabase = await createClient();

  try {
    // 1. Create Supabase auth user
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
      });

    if (authError) throw authError;

    // 2. Create user in our database
    const user = await prisma.user.create({
      data: {
        id: authUser.user.id,
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        createdBy: {
          connect: { id: admin.id },
        },
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function updateUserStatus(
  userId: string,
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
) {
  await requireAdmin();

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error updating user status:", error);
    return { success: false, error: "Failed to update user status" };
  }
}
