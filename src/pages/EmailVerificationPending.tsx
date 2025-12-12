import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

const EmailVerificationPending = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem('pending_verification_email') || 'your email';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-blue-600 font-bold bg-gradient-primary bg-clip-text">
            Verify your email
          </CardTitle>
          <CardDescription>
            A verification email has been sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Please check your inbox and click the verification link to continue.</p>
            <p className="mt-2">Once verified, you can log in to your account.</p>
          </div>
          
          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationPending;
