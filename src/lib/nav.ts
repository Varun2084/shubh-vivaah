import type { Role } from "@/generated/prisma/enums";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Wallet,
  GraduationCap,
  CalendarClock,
  BookOpenCheck,
  Briefcase,
  Megaphone,
  Library,
  Bus,
  School,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT", "LIBRARIAN", "TRANSPORT_STAFF"],
  },
  {
    label: "Admissions",
    href: "/dashboard/admissions",
    icon: UserPlus,
    roles: ["ADMIN"],
  },
  {
    label: "Students",
    href: "/dashboard/students",
    icon: Users,
    roles: ["ADMIN", "TEACHER", "ACCOUNTANT"],
  },
  {
    label: "Academics Setup",
    href: "/dashboard/academics",
    icon: School,
    roles: ["ADMIN"],
  },
  {
    label: "Attendance",
    href: "/dashboard/attendance",
    icon: ClipboardCheck,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT", "LIBRARIAN", "TRANSPORT_STAFF"],
  },
  {
    label: "Fees & Finance",
    href: "/dashboard/fees",
    icon: Wallet,
    roles: ["ADMIN", "ACCOUNTANT", "STUDENT", "PARENT"],
  },
  {
    label: "Examinations",
    href: "/dashboard/exams",
    icon: GraduationCap,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    label: "Timetable",
    href: "/dashboard/timetable",
    icon: CalendarClock,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    label: "Homework",
    href: "/dashboard/homework",
    icon: BookOpenCheck,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    label: "HR & Payroll",
    href: "/dashboard/hr",
    icon: Briefcase,
    roles: ["ADMIN"],
  },
  {
    label: "Notices",
    href: "/dashboard/notices",
    icon: Megaphone,
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT", "ACCOUNTANT", "LIBRARIAN", "TRANSPORT_STAFF"],
  },
  {
    label: "Library",
    href: "/dashboard/library",
    icon: Library,
    roles: ["ADMIN", "LIBRARIAN", "STUDENT", "PARENT"],
  },
  {
    label: "Transport",
    href: "/dashboard/transport",
    icon: Bus,
    roles: ["ADMIN", "TRANSPORT_STAFF", "STUDENT", "PARENT"],
  },
];

export function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
