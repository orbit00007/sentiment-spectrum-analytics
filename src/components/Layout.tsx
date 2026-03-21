import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, CreditCard, MailPlus, Settings } from "lucide-react";
import { getSecureProductId } from "@/lib/secureStorage";
import { useState, useEffect } from "react";
import { regenerateAnalysis } from "@/apiHelpers";
import { useToast } from "@/hooks/use-toast";
import { getSecureAccessToken } from "@/lib/secureStorage";
import { Mail } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  sidebarTrigger?: React.ReactNode;
}

export const Layout = ({ children, showNavigation = true, sidebarTrigger }: LayoutProps) => {
  const location = useLocation();
  const { user, logout, userRoleInt } = useAuth();
  const canInviteUsers = userRoleInt <= 1;
  const navigate = useNavigate();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedProductId = getSecureProductId();
    setProductId(storedProductId || null);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRegenerateAnalysis = async () => {
    if (!productId) return;
    setIsRegenerating(true);
    try {
      const accessToken = getSecureAccessToken();
      await regenerateAnalysis(productId, accessToken);
      toast({
        title: "Analysis in Progress",
        description: "Your analysis has begun. You'll receive a notification on your email when it's ready.",
        duration: Infinity,
      });
      setTimeout(() => {
        window.location.reload();
      }, 20000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border no-print shadow-sm">
          <div className="flex items-center justify-between px-3 md:px-6 md:pl-14 py-2 md:py-3">

            {/* Left: sidebarTrigger + Logo */}
            <div className="flex items-center gap-2 md:gap-3">
              {sidebarTrigger}
              <Link to="/" className="flex items-center gap-1.5 md:gap-2">
                <span className="text-lg md:text-2xl font-bold gradient-text">
                  GeoRankers
                </span>
              </Link>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1.5 md:gap-3">
              {user ? (
                <>
                  {/* Welcome text — desktop only */}
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
                        className="relative h-7 w-7 md:h-10 md:w-10 rounded-full p-0 md:mr-5"
                      >
                        <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs md:text-sm shadow-lg">
                          {user.first_name.charAt(0).toUpperCase()}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-card border-border p-0" align="end" forceMount>
                      <div className="px-3 py-2.5 border-b border-border">
                        <p className="text-sm font-bold text-foreground">
                          {user.first_name} {user.last_name ? `${user.last_name}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <DropdownMenuItem
                          onClick={() => navigate("/settings", { state: { from: location.pathname } })}
                          className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-primary font-medium"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate("/billing", { state: { from: location.pathname } })}
                          className="flex items-center gap-2.5 px-3 py-2 cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Billing</span>
                        </DropdownMenuItem>
                        {canInviteUsers && (
                        <DropdownMenuItem
                          onClick={() => navigate("/invite", { state: { from: location.pathname } })}
                          className="flex items-center gap-2.5 px-3 py-2 cursor-pointer"
                        >
                          <MailPlus className="w-4 h-4" />
                          <span>Invite Team</span>
                        </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : location.pathname === "/login" ? (
                <Link to="/register">
                  <Button variant="outline" size="sm" className="text-xs md:text-sm h-7 md:h-9 px-2 md:px-3">
                    Register
                  </Button>
                </Link>
              ) : location.pathname === "/register" ? (
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-xs md:text-sm h-7 md:h-9 px-2 md:px-3">
                    Login
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-xs md:text-sm h-7 md:h-9 px-2 md:px-3">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="default" size="sm" className="text-xs md:text-sm h-7 md:h-9 px-2 md:px-3">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

          </div>
        </header>
      )}

      <main className="flex-1 pt-[49px]">{children}</main>
    </div>
  );
};