import { TimeEntriesTable } from "@/components/timesheet/TimeEntriesTable";
import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getTimeEntries() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.LOCAL_URL}/api/timesheet-info`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch time entries");
  }

  const data = await response.json();
  return data.entries;
}

export default async function TimeSheetInfoPage() {
  const entries = await getTimeEntries();

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Time Sheet Information
          </h1>
          <p className="text-muted-foreground">
            View and manage your time entries
          </p>
        </div>
        <Suspense fallback={<TimeEntriesTable entries={[]} isLoading={true} />}>
          <TimeEntriesTable entries={entries} isLoading={false} />
        </Suspense>
      </div>
    </div>
  );
}
