import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell, User, Settings, LogOut, CreditCard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Executive Summary" },
    { path: "/analytics", label: "Performance Insights" },
    { path: "/content-hub", label: "Content Hub" },
    { path: "/integrations", label: "Integrations" },
    { path: "/reports", label: "Reports" }
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location === "/" || location === "/dashboard";
    }
    return location === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">RedoraAI</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <span className={`nav-link ${isActive(item.path) ? 'active' : ''} cursor-pointer`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    john.doe@company.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onSelect={() => window.location.href = '/settings'}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onSelect={() => window.location.href = '/settings'}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
