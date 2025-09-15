"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Settings, User, LogOut, MoreHorizontal, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/context/AuthContext" 

interface HeaderProps {
  className?: string
  title?: string
  showSearch?: boolean
}

export default function Header({ className, title = "Lead Management" }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b border-border bg-background px-4 shadow-sm",
        className,
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-foreground truncate max-w-[200px] md:max-w-[400px]">
            {title}
          </h1>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 relative"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {/* Sun in dark mode */}
          <Sun className="absolute h-4 w-4 transition-all rotate-0 scale-0 dark:scale-100 dark:rotate-0 text-yellow-400" />
          {/* Moon in light mode */}
          <Moon className="absolute h-4 w-4 transition-all rotate-0 scale-100 dark:scale-0 text-gray-300" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"></span>
        </Button>

        {/* User Menu */}
        {/* User Section */}
{user ? (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-9 w-9 p-0 rounded-full">
        <Avatar className="h-8 w-8">
          {user.displayimage ? (
            <AvatarImage src={user.displayimage} alt={user.fullname} />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {user.fullname?.charAt(0) ?? "?"}
            </AvatarFallback>
          )}
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user.fullname}</p>
          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="gap-2">
        <User className="h-4 w-4" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2">
        <Settings className="h-4 w-4" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={logout}
        className="gap-2 text-destructive focus:text-destructive"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
) : (
  <Button
    variant="ghost"
    className="h-9 w-9 p-0 rounded-full"
    onClick={() => (window.location.href = "/login")}
  >
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
        ?
      </AvatarFallback>
    </Avatar>
  </Button>
)}


      </div>
    </header>
  )
}
