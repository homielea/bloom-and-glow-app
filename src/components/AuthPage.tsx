
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Heart, Mail, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import EmailVerification from './EmailVerification';
import PasswordReset from './PasswordReset';

interface AuthPageProps {
  onSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const validatePassword = (pwd: string) => {
    return pwd.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (!isLogin) {
      if (!validatePassword(password)) {
        toast({
          title: "Invalid password",
          description: "Password must be at least 8 characters with uppercase, lowercase, and number.",
          variant: "destructive"
        });
        return;
      }
      
      if (password !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure both passwords are the same.",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setVerificationEmail(email);
            setShowEmailVerification(true);
            return;
          }
          throw error;
        }

        toast({
          title: "Welcome back! 👋",
          description: "You've successfully signed in.",
        });

        onSuccess();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: "Account exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive"
            });
            setIsLogin(true);
            return;
          }
          throw error;
        }

        setVerificationEmail(email);
        setShowEmailVerification(true);
        toast({
          title: "Account created! 📧",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <EmailVerification
          email={verificationEmail}
          onVerified={onSuccess}
          onBack={() => {
            setShowEmailVerification(false);
            setVerificationEmail('');
          }}
        />
      </div>
    );
  }

  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <PasswordReset onBack={() => setShowPasswordReset(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-rose-400 to-purple-400 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle>{isLogin ? 'Welcome back' : 'Create your account'}</CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to continue your menopause journey' 
              : 'Join thousands of women navigating menopause with confidence'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {!isLogin && password && !validatePassword(password) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Password must be at least 8 characters with uppercase, lowercase, and number.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Passwords don't match.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create account')}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setShowPasswordReset(true)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Forgot your password?
              </Button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword('');
                setConfirmPassword('');
              }}
              className="font-medium"
            >
              {isLogin ? 'Create one here' : 'Sign in instead'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
