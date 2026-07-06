import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/lib/rbac";
import { logoutAction } from "@/app/actions/auth-actions";
import { LogOut } from "lucide-react";
import type { Role } from "@/generated/prisma/enums";

export function Topbar({ name, role }: { name: string; role: Role }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="text-sm text-muted-foreground">{ROLE_LABELS[role]}</div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <form action={logoutAction}>
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full cursor-default">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
