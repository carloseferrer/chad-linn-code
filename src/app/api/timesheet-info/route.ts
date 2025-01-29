import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TimeEntry } from "@/lib/types";

export async function GET() {
  try {
    const cookieStore = await cookies();
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Transformar los datos de Prisma al tipo TimeEntry
    const formattedEntries: TimeEntry[] = timeEntries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      projectIds: entry.projectIds,
      projectNames: entry.projectNames,
      taskIds: entry.taskIds,
      taskNames: entry.taskNames,
      hoursWorked: Array.isArray(entry.hoursWorked)
        ? entry.hoursWorked
        : [entry.hoursWorked],
      descriptions: entry.descriptions,
      userId: entry.userId,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      entries: formattedEntries,
    });
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
