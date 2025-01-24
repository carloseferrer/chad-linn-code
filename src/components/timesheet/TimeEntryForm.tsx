"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
}

interface TimeEntry {
  id: string;
  project: {
    id: string;
    name: string;
  };
  task: {
    id: string;
    name: string;
  };
  employee: {
    id: string;
    name: string;
  };
  date: string;
  hoursWorked: number;
  description: string;
}

const formSchema = z.object({
  projectId: z.string().min(1, "You must select a project"),
  taskId: z.string().min(1, "You must select a task"),
  employeeId: z.string().min(1, "You must select an employee"),
  date: z.string(),
  hoursWorked: z.number().min(0.5).max(24),
  description: z.string().optional(),
});

type TimeEntryFormValues = z.infer<typeof formSchema>;

export function TimeEntryForm() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      hoursWorked: 0,
      description: "",
    },
  });

  useEffect(() => {
    const loadTimeEntries = async () => {
      try {
        const response = await fetch("/api/notion/timesheet");
        const data = await response.json();

        if (data.success) {
          setTimeEntries(data.entries);

          const uniqueProjects = Array.from(
            new Map(
              data.entries.map((entry) => [entry.project.id, entry.project])
            ).values()
          );
          setProjects(uniqueProjects);

          const uniqueTasks = Array.from(
            new Map(
              data.entries.map((entry) => [entry.task.id, entry.task])
            ).values()
          );
          setTasks(uniqueTasks);

          const uniqueEmployees = Array.from(
            new Map(
              data.entries.map((entry) => [entry.employee.id, entry.employee])
            ).values()
          );
          setEmployees(uniqueEmployees);
        }
      } catch (error) {
        console.error("Error loading time entries:", error);
      }
    };

    loadTimeEntries();
  }, []);

  const onProjectChange = (projectId: string) => {
    const projectTasks = timeEntries
      .filter((entry) => entry.project.id === projectId)
      .map((entry) => entry.task);

    const uniqueTasks = Array.from(
      new Map(projectTasks.map((task) => [task.id, task])).values()
    );

    setTasks(uniqueTasks);
  };

  const onSubmit = async (data: TimeEntryFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/notion/timesheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error saving time entry");

      form.reset();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  onProjectChange(value);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map((project: Project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taskId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        form.watch("projectId")
                          ? "Select a task"
                          : "First select a project"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tasks.length > 0 ? (
                    tasks.map((task: Task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="relative flex items-center justify-center py-2 text-sm text-muted-foreground">
                      {form.watch("projectId")
                        ? "No tasks available for this project"
                        : "Select a project first"}
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hoursWorked"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hours Worked</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Submit Time Entry"}
        </Button>
      </form>
    </Form>
  );
}
