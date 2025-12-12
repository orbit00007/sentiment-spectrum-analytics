import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { getProductsByApplication } from "@/apiHelpers";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with email:', email);
    
    try {
      console.log('Attempting login...');
      
      // Attempt login
      const loginResult = await login(email, password);
      console.log('Login result:', loginResult);
      
      // If email verification is pending
      if (loginResult === 'email_not_verified') {
        console.log('Email not verified, redirecting to verification pending page');
        localStorage.setItem('pending_verification_email', email);
        navigate("/email-verification-pending");
        return;
      }
      
      // If login failed for other reasons
      if (loginResult === false) {
        console.log('Login failed');
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Login successful - clear any pending verification
      console.log('Login successful, clearing pending verification');
      localStorage.removeItem('pending_verification_email');
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      // Use the same logic as Index page
      const accessToken = localStorage.getItem("access_token") || "";
      const applicationId = localStorage.getItem("application_id") || "";
      console.log('Access token:', accessToken ? 'present' : 'missing');
      console.log('Application ID:', applicationId || 'missing');
  
      if (!applicationId) {
        console.log('No application ID, redirecting to input page');
        sessionStorage.setItem("app_initialized", "true");
        navigate("/input");
        return;
      }
  
      console.log('Fetching products for application:', applicationId);
      const products = await getProductsByApplication(applicationId, accessToken);
      console.log('Products fetched:', products);
  
      if (products && Array.isArray(products) && products.length > 0) {
        const firstProduct = products[0];
        console.log('First product:', firstProduct);
  
        // Store product id and keywords
        localStorage.setItem("product_id", firstProduct.id);
        localStorage.setItem("keywords", JSON.stringify(firstProduct.search_keywords || []));
        localStorage.setItem("keyword_count", (firstProduct.search_keywords || []).length.toString());
        
        // Mark app as initialized to prevent auto-redirect on logo click
        sessionStorage.setItem("app_initialized", "true");
        
        console.log('Redirecting to results page');
        navigate("/results", {
          state: {
            website: firstProduct.website || firstProduct.name,
            keywords: firstProduct.search_keywords || [],
            productId: firstProduct.id,
          },
        });
      } else {
        // No products → go to input page
        console.log('No products found, redirecting to input page');
        sessionStorage.setItem("app_initialized", "true");
        navigate("/input");
      }
    } catch (error: any) {
      console.error('Login error caught:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Please check your credentials and try again.";
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      
      <Card className="w-full max-w-md bg-gradient-card border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl text-blue-600 font-bold bg-gradient-primary bg-clip-text">
            Welcome back
          </CardTitle>
          <CardDescription>
            Sign in to your GeoRankers dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              <Link
                to="/forgot-password"
                className="text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div>
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;