export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
  },

  USER: {
    DASHBOARD: "/dashboard",
    PROFILE: "/profile",
    PROJECTS: "/projects",
    SETTINGS: "/settings",
  },

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    PROJECTS: "/admin/projects",
    MILESTONES: "/admin/milestones",
    EMPLOYEES: "/admin/employees",
  },

  TIMESHEET: {
    DASHBOARD: "/timesheet",
    INFO: "/timesheet-info",
  },

  API: {
    USERS: {
      BASE: "/api/users",
      DETAIL: (email: string) => `/api/users/${email}`,
    },
    PROJECTS: {
      BASE: "/api/projects",
      DETAIL: (id: string) => `/api/projects/${id}`,
    },
  },
} as const;

// Ejemplo de uso de tipos para las rutas
export type AppRoutes = typeof ROUTES;
export type AuthRoutes = typeof ROUTES.AUTH;
export type UserRoutes = typeof ROUTES.USER;
export type AdminRoutes = typeof ROUTES.ADMIN;
export type ApiRoutes = typeof ROUTES.API;
