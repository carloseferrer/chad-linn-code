export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  date: string | Date;
  projectIds: string[];
  projectNames: string[];
  taskIds: string[];
  taskNames: string[];
  hoursWorked: number[];
  descriptions: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
