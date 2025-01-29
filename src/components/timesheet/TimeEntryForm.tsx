"use client";

import { useState, useEffect, useCallback } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/hooks/use-user";

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  name: string;
  projectIds: string[];
}

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface TimeEntry {
  id: string;
  projects: Project[];
  tasks: Task[];
  employee: Employee;
  date: string;
  hoursWorked: number;
  descriptions: string[];
  projectNames: string[];
  taskNames: string[];
}

interface ApiResponse {
  success: boolean;
  entries: TimeEntry[];
}

interface NotionEntry {
  id: string;
  // ... otros campos si los necesitas
}

const formSchema = z.object({
  projectId: z.array(z.string()).min(1, "You must select at least one project"),
  taskId: z.array(z.string()).min(1, "You must select at least one task"),
  employeeId: z.string().min(1, "You must select an employee"),
  date: z.string(),
  hoursWorked: z.array(z.number().min(0.5).max(12)),
  descriptions: z.array(z.string().optional()),
});

type TimeEntryFormValues = z.infer<typeof formSchema>;

// Agregar este componente personalizado MultiSelect
const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  {
    value: string[];
    onChange: (value: string[]) => void;
    options: { id: string; name: string; projectIds?: string[] }[];
    placeholder: string;
    projects?: Project[];
    tasks?: Task[];
  }
>(({ value, onChange, options, placeholder, projects, tasks }, ref) => {
  const handleSelect = (optionId: string) => {
    // Prevent selection if project has no tasks
    const option = options.find((opt) => opt.id === optionId);
    if (!option?.projectIds && hasNoTasks(optionId)) {
      return;
    }

    if (value.includes(optionId)) {
      onChange(value.filter((id) => id !== optionId));
    } else {
      onChange([...value, optionId]);
    }
  };

  const handleRemove = (optionId: string) => {
    onChange(value.filter((id) => id !== optionId));
  };

  const selectedOptions = options.filter((option) => value.includes(option.id));

  const getProjectName = (projectId: string) => {
    return projects?.find((p) => p.id === projectId)?.name || "";
  };

  // Modify helper function to check if project has tasks
  const hasNoTasks = (projectId: string) => {
    if (!tasks) return false;
    return !tasks.some((task) => task.projectIds.includes(projectId));
  };

  return (
    <div className="space-y-2">
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
            >
              <span>{option.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(option.id)}
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <Select
        onValueChange={(selectedValue) => handleSelect(selectedValue)}
        value={value[value.length - 1] || ""}
      >
        <SelectTrigger ref={ref} className="w-full">
          <SelectValue placeholder={placeholder}>
            {value.length > 0 ? `${value.length} items selected` : placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            const isDisabled = !option.projectIds && hasNoTasks(option.id);
            return (
              <SelectItem
                key={option.id}
                value={option.id}
                className={`flex items-center gap-2 ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isDisabled}
              >
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="checkbox"
                    checked={value.includes(option.id)}
                    className="h-4 w-4"
                    onChange={() => {}}
                    disabled={isDisabled}
                  />
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center justify-between">
                      <span>{option.name}</span>
                      {!option.projectIds && hasNoTasks(option.id) && (
                        <span className="text-xs text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 rounded px-2 py-0.5 ml-2">
                          No tasks
                        </span>
                      )}
                    </div>
                    {option.projectIds && projects && (
                      <span className="text-xs text-muted-foreground">
                        {option.projectIds.map(getProjectName).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
});

MultiSelect.displayName = "MultiSelect";

export function TimeEntryForm() {
  const { user } = useUser();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isValidEmployee, setIsValidEmployee] = useState(false);
  const [isCheckingEmployee, setIsCheckingEmployee] = useState(true);
  const [filteredEntries, setFilteredEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectTasks, setProjectTasks] = useState<{ [key: string]: Task[] }>(
    {}
  );

  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: [],
      taskId: [],
      date: format(new Date(), "yyyy-MM-dd"),
      hoursWorked: [],
      descriptions: [],
    },
  });

  // Watch taskId to update hoursWorked array
  const selectedTasks = form.watch("taskId");

  useEffect(() => {
    const currentHours = form.getValues("hoursWorked");
    const newHours = Array(selectedTasks.length).fill(0);
    // Preserve existing values
    currentHours.forEach((hours, index) => {
      if (index < newHours.length) {
        newHours[index] = hours;
      }
    });
    form.setValue("hoursWorked", newHours);
  }, [selectedTasks.length, form]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };

    getCurrentUser();
  }, []);

  const loadTimeEntries = useCallback(async () => {
    if (!userEmail) return;

    setIsLoadingEntries(true);
    try {
      const response = await fetch("/api/notion/timesheet");
      const data = (await response.json()) as ApiResponse;

      if (data.success) {
        const userEntries = data.entries.filter(
          (entry) => entry.employee.email === userEmail
        );
        setFilteredEntries(userEntries);

        if (userEntries.length === 0) {
          setIsLoadingEntries(false);
          return;
        }

        const currentEmployee = userEntries[0].employee;
        setEmployees([currentEmployee]);
        form.setValue("employeeId", currentEmployee.id);
      }
    } catch (error) {
      console.error("Error loading time entries:", error);
    } finally {
      setIsLoadingEntries(false);
    }
  }, [userEmail, form.setValue]);

  // Función para cargar proyectos
  const loadProjects = async () => {
    try {
      const response = await fetch("/api/notion/projects");
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    }
  };

  // Modify loadTasks to store tasks per project
  const loadTasks = async (projectIds?: string[]) => {
    try {
      const queryParams = projectIds?.length
        ? `?projectIds=${projectIds.join(",")}`
        : "";
      const response = await fetch(`/api/notion/tasks${queryParams}`);
      const data = await response.json();
      if (data.success) {
        // Group tasks by project
        const tasksByProject: { [key: string]: Task[] } = {};
        data.tasks.forEach((task: Task) => {
          task.projectIds.forEach((projectId) => {
            if (!tasksByProject[projectId]) {
              tasksByProject[projectId] = [];
            }
            tasksByProject[projectId].push(task);
          });
        });
        setProjectTasks(tasksByProject);

        // Set all available tasks for the tasks dropdown
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
    }
  };

  // Modify the helper function to check if project has tasks
  const hasNoTasks = useCallback(
    (projectId: string) => {
      return !projectTasks[projectId] || projectTasks[projectId].length === 0;
    },
    [projectTasks]
  );

  // Update effect to handle project selection
  useEffect(() => {
    if (selectedProjects.length > 0) {
      loadTasks(selectedProjects);
      // Only clear selected tasks if all selected projects have no tasks
      const allProjectsHaveNoTasks = selectedProjects.every(hasNoTasks);
      if (allProjectsHaveNoTasks) {
        form.setValue("taskId", []);
      }
    }
  }, [selectedProjects, hasNoTasks]);

  useEffect(() => {
    const validateEmployee = async () => {
      if (!userEmail) return;

      setIsCheckingEmployee(true);
      try {
        const response = await fetch(
          `/api/notion/employees?email=${userEmail}`
        );
        const data = await response.json();

        if (data.success && data.employees.length > 0) {
          setIsValidEmployee(true);
          // Cargamos los datos en paralelo
          await Promise.all([
            loadProjects(), // Esto establecerá todos los proyectos disponibles
            loadTasks(), // Esto establecerá todas las tareas disponibles
            loadTimeEntries(),
          ]);
        } else {
          setIsValidEmployee(false);
        }
      } catch (error) {
        console.error("Error validating employee:", error);
        setIsValidEmployee(false);
      } finally {
        setIsCheckingEmployee(false);
      }
    };

    validateEmployee();
  }, [userEmail, loadTimeEntries]);

  const onSubmit = async (data: TimeEntryFormValues) => {
    setIsLoading(true);
    try {
      const sanitizedDescriptions = data.descriptions.map(
        (desc) => desc || null
      );

      const notionResponse = await fetch("/api/notion/timesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: data.projectId,
          taskId: data.taskId,
          employeeId: data.employeeId,
          date: data.date,
          hoursWorked: data.hoursWorked,
          descriptions: data.descriptions,
        }),
      });

      const notionResult = await notionResponse.json();

      if (!notionResult.success) {
        throw new Error(notionResult.message || "Error saving to Notion");
      }

      // 2. Guardamos en nuestra base de datos
      const selectedProjects = projects.filter((p) =>
        data.projectId.includes(p.id)
      );
      const selectedTasks = tasks.filter((t) => data.taskId.includes(t.id));

      // Ahora notionResult.entries es un array, tomamos todos los IDs
      const notionEntryIds = notionResult.entries.map(
        (entry: NotionEntry) => entry.id
      );

      const timeEntryResponse = await fetch("/api/timesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectIds: selectedProjects.map((p) => p.id),
          projectNames: selectedProjects.map((p) => p.name),
          taskIds: selectedTasks.map((t) => t.id),
          taskNames: selectedTasks.map((t) => t.name),
          date: data.date,
          hoursWorked: data.hoursWorked,
          descriptions: sanitizedDescriptions,
          notionEntryIds: notionEntryIds, // Guardamos todos los IDs de Notion
        }),
      });

      if (!timeEntryResponse.ok) {
        throw new Error("Error saving time entry");
      }

      toast.success("Time entry saved successfully!");
      form.reset();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save time entry");
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role === "ADMIN") {
    return (
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-muted-foreground">
          Time entry form is only available for employees.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!userEmail || isCheckingEmployee ? (
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-muted-foreground">
              {!userEmail
                ? "Loading user information..."
                : "Validating employee..."}
            </p>
          </div>
        </div>
      ) : !isValidEmployee ? (
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-red-500">
            Your email is not registered in our employee database. Please
            contact your administrator.
          </p>
        </div>
      ) : isLoadingEntries ? (
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-muted-foreground">Loading your entries...</p>
          </div>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-muted-foreground">
            No time entries found for your account. Start by submitting your
            first entry.
          </p>
        </div>
      ) : (
        <>
          {/* <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Your Recent Entries</h3>
            <div className="space-y-2">
              {filteredEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="p-3 bg-muted rounded-lg text-sm">
                  <div className="font-medium">
                    {entry.projectNames?.join(", ") || ""} -{" "}
                    {entry.taskNames?.join(", ") || ""}
                  </div>
                  <div className="text-muted-foreground">
                    {entry.date} •{" "}
                    {Array.isArray(entry.hoursWorked)
                      ? entry.hoursWorked.reduce((a, b) => a + b, 0)
                      : 0}{" "}
                    hours
                  </div>
                  {entry.taskNames?.map((taskName, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{taskName}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {Array.isArray(entry.hoursWorked)
                            ? entry.hoursWorked[index]
                            : 0}{" "}
                          hrs
                        </span>
                      </div>
                      <FormField
                        control={form.control}
                        name={`descriptions.${index}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder={`Description for ${taskName}`}
                                {...field}
                                defaultValue={entry.descriptions?.[index] || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div> */}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projects</FormLabel>
                    <FormControl>
                      <MultiSelect
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          setSelectedProjects(value);
                        }}
                        options={projects.map((project) => ({
                          id: project.id,
                          name: project.name,
                        }))}
                        placeholder="Select projects"
                        projects={projects}
                        tasks={Object.values(projectTasks).flat()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taskId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tasks</FormLabel>
                    <FormControl>
                      <MultiSelect
                        value={field.value}
                        onChange={field.onChange}
                        options={tasks.map((task) => ({
                          id: task.id,
                          name: task.name,
                          projectIds: task.projectIds,
                        }))}
                        placeholder="Select tasks"
                        projects={projects}
                      />
                    </FormControl>
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
                        {employees.map((employee: Employee) => (
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

              {selectedTasks.map((taskId, index) => {
                const taskItem = tasks.find((t) => t.id === taskId);
                return (
                  <div key={taskId} className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-3">
                        <Badge
                          variant="outline"
                          className="w-fit text-base py-1 px-3"
                        >
                          {taskItem?.name}
                        </Badge>

                        <FormField
                          control={form.control}
                          name={`hoursWorked.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <FormLabel className="text-sm font-medium min-w-32">
                                  Hours Worked
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    max="12"
                                    placeholder="0.0"
                                    className="bg-background text-center w-full sm:w-32 text-lg font-semibold"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseFloat(e.target.value))
                                    }
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`descriptions.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                Description (optional)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={`Add notes for ${taskItem?.name}`}
                                  className="bg-background resize-none"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Submit Time Entry"}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
