"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  List,
  Eye,
  Upload,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  isActive?: boolean;
}

const navigationItems: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Create Lead", icon: Plus, href: "/create" },
  { title: "List & Search", icon: List, href: "/buyers" },
  { title: "View & Edit", icon: Eye, href: "/edit" },
  { title: "Import & Export", icon: Upload, href: "/import-export" },
];

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false); // Fix hydration
  const router = useRouter();

  // Only render after mount to prevent SSR mismatch
  useEffect(() => setMounted(true), []);

  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);

  const handleNavClick = (item: NavItem) => {
    if (item.href) {
      router.push(item.href);
    } else {
      router.push("/not-found"); // Safe fallback
    }
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <Button
        key={item.title}
        variant="ghost"
        onClick={() => handleNavClick(item)}
        className={cn(
          "w-full gap-3 px-3 py-2 h-auto font-medium text-sm",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "transition-colors duration-200",
          item.isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
          isCollapsed ? "justify-center" : "justify-start"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!isCollapsed && <span className="flex-1 text-left text-balance">{item.title}</span>}
      </Button>
    );
  };

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <Button
          variant="ghost"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm p-0"
          onClick={() => router.push("/")}
        >
          L
        </Button>
        {!isCollapsed && (
          <div className="flex-1">
            <Button
              variant="ghost"
              className="p-0 h-auto font-semibold text-sidebar-foreground hover:bg-transparent"
              onClick={() => router.push("/")}
            >
              <h2 className="text-balance">Lead Manager</h2>
            </Button>
            <p className="text-xs text-muted-foreground">CRM System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-3 px-3 pb-4">
        <div className="space-y-1">{navigationItems.map((item) => renderNavItem(item))}</div>
      </div>

      {/* Toggle Button */}
      <div className="px-2 py-2">
        <Button variant="ghost" size="sm" onClick={toggleCollapsed} className="w-full h-8 p-0">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Quick Action Button */}
      <div className="px-3 pb-4">
        <Button
          onClick={() => router.push("/create")} // Points to create lead page
          className={cn(
            "gap-2 bg-primary hover:bg-primary/90 text-primary-foreground",
            isCollapsed ? "w-10 h-10 p-0" : "w-full"
          )}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && "New Lead"}
        </Button>
      </div>
    </div>
  );
}
