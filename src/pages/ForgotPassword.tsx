import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "@/apiHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Forgot password form submitted with email:', email);
    setIsLoading(true);
    
    try {
      console.log('Calling forgot password API...');
      const response = await forgotPassword(email);
      console.log('Forgot password API response:', response);
      setSubmitted(true);
      toast({
        title: "Reset link sent!",
        description: "Please check your email for the password reset link.",
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Please check your email and try again.";
      toast({
        title: "Failed to send reset link",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-card border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl text-blue-600 font-bold bg-gradient-primary bg-clip-text">
              Check your email
            </CardTitle>
            <CardDescription>
              We've sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl text-blue-600 font-bold bg-gradient-primary bg-clip-text">
            Forgot password?
          </CardTitle>
          <CardDescription>
            Enter your email to receive a reset link
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
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              <ArrowLeft className="w-3 h-3 inline mr-1" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
