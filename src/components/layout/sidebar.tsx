"use client";

import { cn } from "@/lib/utils";
import { Home, Users, FileText, Settings, Milestone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/utils/url";

const menuItems = [
  { icon: Home, label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
  { icon: Users, label: "Users", href: ROUTES.ADMIN.USERS },
  { icon: FileText, label: "Projects", href: ROUTES.ADMIN.PROJECTS },
  { icon: Milestone, label: "Milestones", href: ROUTES.ADMIN.MILESTONES },
  { icon: Settings, label: "Settings", href: ROUTES.ADMIN.SETTINGS },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-card border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>
      <nav className="space-y-1 px-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
