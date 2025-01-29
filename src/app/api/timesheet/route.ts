import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { CookieOptions } from "@supabase/ssr";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    // Creamos el cliente de Supabase correctamente
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set(name, "", options);
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Verificar que todos los campos necesarios existan
    if (
      !body ||
      !Array.isArray(body.projectIds) ||
      !Array.isArray(body.taskIds) ||
      !body.date ||
      !Array.isArray(body.hoursWorked)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid required fields",
        },
        { status: 400 }
      );
    }

    try {
      const timeEntry = await prisma.timeEntry.create({
        data: {
          userId: user.id,
          projectIds: body.projectIds,
          projectNames: body.projectNames,
          taskIds: body.taskIds,
          taskNames: body.taskNames,
          date: new Date(body.date),
          hoursWorked: body.hoursWorked,
          descriptions: (body.descriptions || []).map(
            (d: string | null) => d || ""
          ),
          notionEntryIds: body.notionEntryIds || [],
        },
      });

      return NextResponse.json({
        success: true,
        entry: timeEntry,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Error creating database entry",
          details:
            dbError instanceof Error
              ? dbError.message
              : "Unknown database error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
