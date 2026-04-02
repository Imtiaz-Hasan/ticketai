"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Plus,
  User,
  LogOut,
  Menu,
  Shield,
  Headset,
  BarChart3,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Tickets", href: "/admin/tickets", icon: Ticket },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Profile", href: "/admin/profile", icon: User },
  ],
  AGENT: [
    { label: "Dashboard", href: "/agent", icon: LayoutDashboard },
    { label: "My Tickets", href: "/agent/tickets", icon: Ticket },
    { label: "Profile", href: "/agent/profile", icon: User },
  ],
  CUSTOMER: [
    { label: "Dashboard", href: "/customer", icon: LayoutDashboard },
    { label: "My Tickets", href: "/customer/tickets", icon: Ticket },
    { label: "New Ticket", href: "/customer/tickets/new", icon: Plus },
    { label: "Profile", href: "/customer/profile", icon: User },
  ],
};

const roleIcons: Record<Role, React.ComponentType<{ className?: string }>> = {
  ADMIN: Shield,
  AGENT: Headset,
  CUSTOMER: User,
};

interface SidebarProps {
  userName: string;
  userEmail: string;
  userRole: Role;
}

function SidebarContent({ userName, userEmail, userRole }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems[userRole];
  const RoleIcon = roleIcons[userRole];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5">
        <BarChart3 className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold">TicketAI</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const basePath = `/${userRole.toLowerCase()}`;
            const isExact = pathname === item.href;
            const isChild = item.href !== basePath && pathname.startsWith(item.href + "/");
            const hasMoreSpecificMatch = items.some(
              (other) => other.href !== item.href && pathname.startsWith(other.href) && other.href.startsWith(item.href)
            );
            const isActive = isExact || (isChild && !hasMoreSpecificMatch);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <RoleIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40 lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent {...props} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-64 flex-col border-r bg-card fixed left-0 top-0">
        <SidebarContent {...props} />
      </aside>
    </>
  );
}
