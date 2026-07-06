import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(allowed: Role[]) {
  const session = await requireAuth();
  if (!allowed.includes(session.user.role)) redirect("/dashboard");
  return session;
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  TEACHER: "Teacher",
  STUDENT: "Student",
  PARENT: "Parent",
  ACCOUNTANT: "Accountant",
  LIBRARIAN: "Librarian",
  TRANSPORT_STAFF: "Transport Staff",
};
