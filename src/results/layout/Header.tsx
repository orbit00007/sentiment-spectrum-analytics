import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, FileDown, User, LogOut, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { regenerateAnalysis } from "@/apiHelpers";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mobileNavItems = [
  { label: "Overview", path: "/newresults" },
  { label: "Executive Summary", path: "/newresults/executive-summary" },
  { label: "Prompts", path: "/newresults/prompts" },
  { label: "Sources", path: "/newresults/sources-all" },
  { label: "Competitors", path: "/newresults/competitors-comparisons" },
  { label: "Brand Sentiment", path: "/newresults/brand-sentiment" },
  { label: "Recommendations", path: "/newresults/recommendations" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, products } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const storedProductId = localStorage.getItem("product_id");
    setProductId(storedProductId);
  }, [location]);

  // Handle mobile menu body scroll lock
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNewAnalysis = () => {
    const currentWebsite = products?.[0]?.website || "";
    const currentProductId = products?.[0]?.id || productId || "";

    navigate("/input", {
      state: {
        prefillWebsite: currentWebsite,
        productId: currentProductId,
        isNewAnalysis: true,
        disableWebsiteEdit: true,
      },
    });
  };

  const handleRegenerateAnalysis = async () => {
    if (!productId) return;

    setIsRegenerating(true);
    try {
      const accessToken = localStorage.getItem("access_token") || "";
      await regenerateAnalysis(productId, accessToken);

      toast({
        title: "Analysis in Progress",
        description: "Your analysis has begun. Please stay on this page, you'll receive a notification here when it's ready.",
        duration: 10000,
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

  const handleGenerateReport = useCallback(() => {
    setIsGeneratingReport(true);
    
    // Add print styles dynamically
    const printStyleId = 'print-report-styles';
    let styleSheet = document.getElementById(printStyleId) as HTMLStyleElement;
    
    if (!styleSheet) {
      styleSheet = document.createElement('style');
      styleSheet.id = printStyleId;
      document.head.appendChild(styleSheet);
    }
    
    styleSheet.textContent = `
      @media print {
        @page {
          size: A4;
          margin: 15mm;
        }
        
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-size: 12px;
        }
        
        .no-print, 
        [class*="no-print"],
        header,
        nav,
        .fixed,
        button,
        .sidebar,
        [data-sidebar] {
          display: none !important;
        }
        
        .print-only-header {
          display: block !important;
        }
        
        * {
          box-shadow: none !important;
        }
        
        .bg-card {
          background: white !important;
          border: 1px solid #e5e7eb !important;
        }
      }
    `;

    toast({
      title: "Generating Report",
      description: "Preparing your report for download...",
      duration: 2000,
    });

    // Small delay to show the toast, then trigger print
    setTimeout(() => {
      window.print();
      setIsGeneratingReport(false);
    }, 500);
  }, [toast]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border no-print">
        <div className="flex items-center justify-between px-3 md:px-6 md:pl-14 py-2 md:py-3">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 -ml-1 text-foreground touch-manipulation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <Link to="/" className="flex items-center gap-1.5 md:gap-2">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary to-amplitude-purple flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-[10px] md:text-sm">G</span>
              </div>
              <span className="font-semibold text-foreground text-xs md:text-base">GeoRankers</span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 md:gap-4">
            {/* New Analysis Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 text-[10px] md:text-sm px-2 py-1 md:px-3 md:py-2 h-7 md:h-9"
              onClick={handleNewAnalysis}
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">New Analysis</span>
              <span className="sm:hidden">New</span>
            </Button>

            {/* Generate Report Button */}
            <Button 
              size="sm" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] md:text-sm px-2 py-1 md:px-4 md:py-2 gap-1 h-7 md:h-9"
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
            >
              <FileDown className={cn("w-3 h-3 md:w-4 md:h-4", isGeneratingReport && "animate-pulse")} />
              <span className="hidden sm:inline">{isGeneratingReport ? "Generating..." : "Generate Report"}</span>
              <span className="sm:hidden">Report</span>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-7 w-7 md:h-10 md:w-10 rounded-full p-0"
                  >
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs md:text-sm shadow-lg">
                      {user.first_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{user.first_name} {user.last_name}</span>
                  </DropdownMenuItem>
                  {productId && (
                    <DropdownMenuItem
                      onClick={handleRegenerateAnalysis}
                      disabled={isRegenerating}
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span>Regenerate Analysis</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1 md:gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs md:text-sm h-7 md:h-9 px-2 md:px-3">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm" className="text-xs md:text-sm h-7 md:h-9 px-2 md:px-3">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden touch-manipulation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div className={cn(
        "fixed top-[49px] left-0 right-0 bg-card border-b border-border z-50 md:hidden transition-all duration-300 overflow-hidden",
        mobileMenuOpen ? "max-h-[80vh] opacity-100 overflow-y-auto" : "max-h-0 opacity-0"
      )}>
        <nav className="p-3 space-y-1">
          {mobileNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors touch-manipulation",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted active:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="px-3 py-2.5 text-sm text-muted-foreground">
            <span className="font-medium">Content Hub</span>
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">Coming Soon</span>
          </div>
        </nav>
      </div>
    </>
  );
};