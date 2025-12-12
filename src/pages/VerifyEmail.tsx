import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "@/apiHelpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('Verify email page loaded with token:', token);
    
    if (!token) {
      console.log('No token found in URL');
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    console.log('Calling verify email API with token:', token);
    verifyEmail(token)
      .then((response) => {
        console.log('Verify email API response:', response);
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
        // Clear pending verification email from localStorage
        localStorage.removeItem('pending_verification_email');
      })
      .catch((error) => {
        console.error('Verify email error:', error);
        console.error('Error response:', error.response?.data);
        setStatus('error');
        setMessage('Failed to verify email. The link may be expired or invalid.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl text-blue-600 font-bold bg-gradient-primary bg-clip-text">
            Email Verification
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email...'}
            {status === 'success' && 'Email verified!'}
            {status === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="w-12 h-12 mx-auto text-red-500" />
          )}
          
          <p className="text-muted-foreground">{message}</p>
          
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

export default VerifyEmail;
