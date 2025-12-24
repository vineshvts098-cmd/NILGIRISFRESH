import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Mail, CheckCircle, KeyRound } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const newPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset' | 'verify-email';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, signUp, signIn, resetPassword, updatePassword } = useAuth();

  // Get the redirect path from location state, default to home
  const from = (location.state as { from?: string })?.from || '/';

  // Check URL params for password reset mode
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  useEffect(() => {
    // If user is logged in and not in reset password mode, redirect
    if (user && mode !== 'reset') {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        signUpSchema.parse(formData);
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({ 
              title: 'Account already exists',
              description: 'Please sign in instead.',
              variant: 'destructive' 
            });
            setMode('signin');
          } else {
            toast({ title: error.message, variant: 'destructive' });
          }
        } else {
          setMode('verify-email');
          toast({ title: 'Check your email for verification link!' });
        }
      } else if (mode === 'signin') {
        signInSchema.parse({ email: formData.email, password: formData.password });
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            toast({ 
              title: 'Email not verified',
              description: 'Please check your email for the verification link.',
              variant: 'destructive' 
            });
          } else if (error.message.includes('Invalid login')) {
            toast({ 
              title: 'Invalid credentials',
              description: 'Please check your email and password.',
              variant: 'destructive' 
            });
          } else {
            toast({ title: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Welcome back!' });
          navigate(from, { replace: true });
        }
      } else if (mode === 'forgot') {
        resetSchema.parse({ email: formData.email });
        const { error } = await resetPassword(formData.email);
        if (error) {
          toast({ title: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Password reset email sent!' });
          setMode('signin');
        }
      } else if (mode === 'reset') {
        newPasswordSchema.parse({ password: formData.password, confirmPassword: formData.confirmPassword });
        const { error } = await updatePassword(formData.password);
        if (error) {
          toast({ title: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Password updated successfully!' });
          navigate('/', { replace: true });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'signin': return 'Welcome Back';
      case 'forgot': return 'Reset Password';
      case 'reset': return 'Set New Password';
      case 'verify-email': return 'Verify Your Email';
      default: return 'Sign In';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signup': return 'Sign up to place orders and track them';
      case 'signin': return 'Sign in to continue shopping';
      case 'forgot': return 'Enter your email to receive a reset link';
      case 'reset': return 'Enter your new password';
      case 'verify-email': return 'We sent a verification link to your email';
      default: return '';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'verify-email': return <CheckCircle className="w-8 h-8 text-primary" />;
      case 'reset': return <KeyRound className="w-8 h-8 text-primary" />;
      default: return <Mail className="w-8 h-8 text-primary" />;
    }
  };

  // Email verification success screen
  if (mode === 'verify-email') {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
                Check Your Email
              </h1>
              <p className="text-muted-foreground mb-6">
                We sent a verification link to <strong>{formData.email}</strong>. 
                Click the link in the email to verify your account.
              </p>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    resetForm();
                    setMode('signin');
                  }}
                >
                  Back to Sign In
                </Button>
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {getIcon()}
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                {getTitle()}
              </h1>
              <p className="text-muted-foreground mt-2">
                {getSubtitle()}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your name"
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                  )}
                </div>
              )}

              {(mode === 'signin' || mode === 'signup' || mode === 'forgot') && (
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>
              )}

              {(mode === 'signin' || mode === 'signup' || mode === 'reset') && (
                <div>
                  <Label htmlFor="password">
                    {mode === 'reset' ? 'New Password' : 'Password'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password}</p>
                  )}
                </div>
              )}

              {mode === 'reset' && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {mode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMode('forgot');
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === 'signup' && 'Create Account'}
                {mode === 'signin' && 'Sign In'}
                {mode === 'forgot' && 'Send Reset Link'}
                {mode === 'reset' && 'Update Password'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('signup');
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Don't have an account? Sign up
                </button>
              )}
              {mode === 'signup' && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('signin');
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Already have an account? Sign in
                </button>
              )}
              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('signin');
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back to sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
