"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LayoutDashboard, ListTodo, LogOut, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/members", label: "Members", icon: Users },
];

export function NavBar({ orgName, email }: { orgName: string; email: string }) {
  const pathname = usePathname();
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <span className="hidden text-sm font-semibold sm:inline">{orgName}</span>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-md bg-muted"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon className="relative z-10 size-4" />
                  <span className="relative z-10 hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <Avatar className="size-7">
              <AvatarFallback className="bg-brand text-xs text-brand-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-40 truncate text-xs text-muted-foreground">{email}</span>
          </div>
          <ThemeToggle />
          <form action={logout}>
            <Button type="submit" variant="ghost" size="icon" className="size-8">
              <LogOut className="size-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
