import { TimeEntryForm } from "@/components/timesheet/TimeEntryForm";

export default function TimesheetPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Time Entry</h1>
      <TimeEntryForm />
    </div>
  );
}
