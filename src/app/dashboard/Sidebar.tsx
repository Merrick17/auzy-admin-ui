"use client"
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLogout } from '@/hooks/auth';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Users", href: "/dashboard/users" },
  { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
  { icon: FileText, label: "Posts", href: "/dashboard/posts" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { mutate: logout } = useLogout();

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      <div className="flex items-center justify-center py-6">
        <Image src="/logo.png" alt="Logo" width={120} height={40} />
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href}>
            <a
              className={cn(
                "flex items-center p-2 text-base font-medium rounded-md hover:bg-gray-100",
                pathname === item.href ? "bg-gray-100" : "text-gray-600"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </a>
          </Link>
        ))}
      </nav>
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => logout()}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar; 