"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Download, MoreVertical, Search, Clock } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TimeEntryModal } from "@/components/modals/time-entry-modal";

interface TimeEntry {
  id: string;
  date: string;
  projectNames: string[];
  taskNames: string[];
  hoursWorked: number[];
  descriptions: string[];
}

interface TimeEntriesTableProps {
  entries: TimeEntry[];
  isLoading: boolean;
}

export function TimeEntriesTable({
  entries,
  isLoading,
}: TimeEntriesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);

  const filteredEntries = entries.filter(
    (entry) =>
      entry.projectNames.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      entry.taskNames.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      entry.descriptions?.some((description) =>
        description.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const downloadCsv = () => {
    const headers = [
      "Date",
      "Projects",
      "Tasks",
      "Hours per Task",
      "Total Hours",
      "Description",
    ];
    const csvData = entries.map((entry) => [
      format(new Date(entry.date), "yyyy-MM-dd"),
      entry.projectNames.join("; "),
      entry.taskNames.join("; "),
      entry.hoursWorked.join("; "),
      entry.hoursWorked.reduce((a, b) => a + b, 0).toString(),
      entry.descriptions.join("; "),
    ]);

    const csv = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time-entries-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>Loading your time entries...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time Entries</CardTitle>
              <CardDescription>
                View and manage your time entries
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={downloadCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date
                      </div>
                    </TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Tasks
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Hours
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No entries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {format(new Date(entry.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {entry.projectNames.map((name, index) => (
                              <Badge key={index} variant="secondary">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col gap-2">
                            {entry.taskNames.map((name, index) => (
                              <Badge key={index} variant="outline">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              {entry.hoursWorked.reduce((a, b) => a + b, 0)}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              hrs
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                          {entry.descriptions.join("; ") || "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedEntry(entry)}
                              >
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <TimeEntryModal
        selectedEntry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </>
  );
}
