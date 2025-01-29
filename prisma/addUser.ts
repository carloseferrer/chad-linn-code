import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addNewUser() {
  try {
    // Crear nuevo usuario en Supabase
    const { data: newUserAuth, error: userError } =
      await supabase.auth.admin.createUser({
        email: "carlosferrerdev@gmail.com",
        password: "Carlos2007$",
        email_confirm: true,
      });

    if (userError) throw userError;

    // Crear usuario en Prisma
    await prisma.user.create({
      data: {
        id: newUserAuth.user.id,
        email: newUserAuth.user.email!,
        firstName: "Carlos",
        lastName: "Ferrer",
        role: "USER",
        status: "ACTIVE",
      },
    });

    console.log("New user created successfully");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addNewUser();
