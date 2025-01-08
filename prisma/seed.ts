// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

// Crear el cliente de Supabase con la service_role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  try {
    // Crear admin en Supabase
    const { data: adminAuth, error: adminError } =
      await supabase.auth.admin.createUser({
        email: "admin@test.com",
        password: "admin123456",
        email_confirm: true,
      });

    if (adminError) throw adminError;

    // Crear admin en Prisma
    const admin = await prisma.user.create({
      data: {
        id: adminAuth.user.id,
        email: adminAuth.user.email!,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    // Crear usuario regular en Supabase
    const { data: userAuth, error: userError } =
      await supabase.auth.admin.createUser({
        email: "user@test.com",
        password: "user123456",
        email_confirm: true,
      });

    if (userError) throw userError;

    // Crear usuario regular en Prisma
    await prisma.user.create({
      data: {
        id: userAuth.user.id,
        email: userAuth.user.email!,
        firstName: "Normal",
        lastName: "User",
        role: "USER",
        status: "ACTIVE",
        createdById: admin.id,
      },
    });

    console.log("Users created successfully");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
