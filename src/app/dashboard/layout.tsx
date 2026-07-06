import { requireAuth } from "@/lib/rbac";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 shrink-0 border-r md:block">
        <SidebarNav role={session.user.role} />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar name={session.user.name} role={session.user.role} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
