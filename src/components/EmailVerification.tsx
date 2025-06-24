
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ email, onVerified, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResendVerification = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setResent(true);
        toast({
          title: "Verification email sent! 📧",
          description: "Check your email for the verification link.",
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          We've sent a verification link to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Click the link in your email to verify your account and complete registration.
          </AlertDescription>
        </Alert>

        {resent && (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Verification email resent! Check your inbox and spam folder.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button 
            onClick={handleResendVerification}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Resend verification email
          </Button>
          
          <Button 
            onClick={onBack}
            variant="ghost"
            className="w-full"
          >
            Back to login
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Didn't receive the email? Check your spam folder or try resending.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
