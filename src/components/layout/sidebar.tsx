"use client";

import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Settings,
  ClipboardList,
  FileText,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/utils/url";
import { useUser } from "@/lib/hooks/use-user";

const menuItems = [
  { icon: Home, label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
  {
    icon: ClipboardList,
    label: "Time Form",
    href: ROUTES.TIMESHEET.DASHBOARD,
    userOnly: true,
  },
  {
    icon: FileText,
    label: "Time Sheet Info",
    href: ROUTES.TIMESHEET.INFO,
    userOnly: true,
  },
  {
    icon: Users,
    label: "Employees",
    href: ROUTES.ADMIN.USERS,
    adminOnly: true,
  },
  {
    icon: UserPlus,
    label: "Employee Management",
    href: ROUTES.ADMIN.EMPLOYEES,
    adminOnly: true,
  },
  { icon: Settings, label: "Settings", href: ROUTES.USER.SETTINGS },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const isAdmin = user?.role === "ADMIN";

  console.log("User data:", user);
  console.log("Is Admin:", isAdmin);

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          // Mobile: fixed position with transform
          "fixed md:static inset-y-0 left-0 z-30 w-64 bg-card border-r transition-transform duration-200 ease-in-out",
          // Desktop: static position with fixed height and overflow
          "md:h-[calc(100vh-64px)] md:overflow-y-auto",
          !isOpen && "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full md:h-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold">
              {isAdmin ? "Admin Panel" : "User Panel"}
            </h2>
          </div>
          <nav className="space-y-1 px-3">
            {menuItems
              .filter(
                (item) =>
                  (!item.adminOnly || isAdmin) && (!item.userOnly || !isAdmin)
              )
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
