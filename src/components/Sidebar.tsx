"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
  CreditCard,
  FileText,
  Menu,
  X,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLogout } from '@/hooks/auth';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Users", href: "/dashboard/users" },
  { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
  { icon: FileText, label: "Posts", href: "/dashboard/posts" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const logout = useLogout();
  const pathname = usePathname();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image
                  src="/assets/auzy_logo.png"
                  alt="Auzy Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                  Auzy Admin
                </h1>
                <p className="text-xs text-muted-foreground">Management Dashboard</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2 mb-1",
                      isActive && "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
} 