import { User } from "@/lib/types";

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
    status: "ACTIVE",
    lastLoginAt: "2024-03-20T10:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "USER",
    status: "ACTIVE",
    lastLoginAt: "2024-03-19T15:30:00Z",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  // Add more mock users as needed
];
