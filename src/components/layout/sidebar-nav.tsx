"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navForRole } from "@/lib/nav";
import { GraduationCap } from "lucide-react";
import type { Role } from "@/generated/prisma/enums";

export function SidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <GraduationCap className="h-6 w-6 text-sidebar-primary" />
        <span className="font-semibold tracking-tight">Shubh Vidyalaya ERP</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
