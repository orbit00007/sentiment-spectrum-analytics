import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, Search, BarChart3, User, LogOut } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export const Layout = ({ children, showNavigation = true }: LayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {showNavigation && (
        <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl md:text-3xl font-bold gradient-text">
                  GeoRankers
                </span>
              </Link>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    {/* Desktop Profile */}
                    <div className="hidden md:flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground">
                        Welcome, {user.first_name}
                      </span>
                    </div>

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="relative h-10 w-10 rounded-full p-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                            {user.first_name.charAt(0).toUpperCase()}
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount
                      >
                        <DropdownMenuItem className="flex items-center space-x-2 md:hidden">
                          <User className="w-4 h-4" />
                          <span>
                            {user.first_name} {user.last_name}
                          </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="flex items-center space-x-2 text-destructive focus:text-destructive"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : location.pathname === "/login" ? (
                  <Link to="/register">
                    <Button variant="outline" size="sm">
                      Register
                    </Button>
                  </Link>
                ) : location.pathname === "/register" ? (
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="default" size="sm">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-1">{children}</main>
    </div>
  );
};
