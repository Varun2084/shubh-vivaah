import { requireAuth } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome, {session.user.name}</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening at school today.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Analytics widgets coming up.
        </CardContent>
      </Card>
    </div>
  );
}
