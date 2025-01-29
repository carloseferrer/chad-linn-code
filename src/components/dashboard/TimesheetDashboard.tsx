"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeEntry } from "@/lib/types";
import {
  Clock,
  Calendar,
  Briefcase,
  Target,
  Plus,
  FileText,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { useRouter } from "next/navigation";
import { BarChart } from "@/components/ui/bar-chart";

interface TimesheetDashboardProps {
  entries: TimeEntry[];
}

export function TimesheetDashboard({ entries }: TimesheetDashboardProps) {
  const router = useRouter();
  const now = new Date();

  // Calculate metrics
  const totalHoursThisMonth = entries
    .filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce(
      (total, entry) => total + entry.hoursWorked.reduce((a, b) => a + b, 0),
      0
    );

  const uniqueProjects = [
    ...new Set(entries.flatMap((entry) => entry.projectNames)),
  ];
  const uniqueTasks = [...new Set(entries.flatMap((entry) => entry.taskNames))];

  const lastEntry = entries[0]; // Assuming they're ordered by date

  // Prepare data for the last 7 days chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(now, i);
    const dayEntries = entries.filter(
      (entry) =>
        format(new Date(entry.date), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );
    const hours = dayEntries.reduce(
      (total, entry) => total + entry.hoursWorked.reduce((a, b) => a + b, 0),
      0
    );
    return {
      name: format(date, "EEE"),
      hours: hours,
    };
  }).reverse();

  return (
    <div className="space-y-6">
      {/* Stats Cards - Responsive grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalHoursThisMonth.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              Different projects this month
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Completed
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Different tasks recorded
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Entry</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastEntry ? format(new Date(lastEntry.date), "dd MMM") : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastEntry ? lastEntry.projectNames[0] : "No entries"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Actions - Responsive grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-medium">
              Last 7 Days Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[200px] sm:h-[300px]">
              <BarChart
                data={last7Days}
                xField="name"
                yField="hours"
                height="100%"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-medium">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full justify-start text-sm sm:text-base"
                variant="outline"
                onClick={() => router.push("/timesheet")}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Time Entry
              </Button>
              <Button
                className="w-full justify-start text-sm sm:text-base"
                variant="outline"
                onClick={() => router.push("/timesheet-info")}
              >
                <FileText className="mr-2 h-4 w-4" />
                View All Entries
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
