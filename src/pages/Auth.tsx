import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Phone, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const phoneSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[0-9+]+$/, 'Please enter a valid phone number'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export default function Auth() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpValue, setOtpValue] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const [formData, setFormData] = useState({
    phone: '',
    fullName: '',
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, sendOtp, verifyOtp } = useAuth();

  // Get the redirect path from location state, default to home
  const from = (location.state as { from?: string })?.from || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      phoneSchema.parse(formData);

      const { error } = await sendOtp(formData.phone);
      if (error) {
        toast({ 
          title: 'Failed to send OTP',
          description: error.message,
          variant: 'destructive' 
        });
      } else {
        toast({ title: 'OTP sent to your phone!' });
        setStep('otp');
        setResendTimer(60);
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

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      toast({ title: 'Please enter the complete OTP', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await verifyOtp(formData.phone, otpValue, formData.fullName);
      if (error) {
        toast({ 
          title: 'Invalid OTP',
          description: 'Please check the code and try again.',
          variant: 'destructive' 
        });
        setOtpValue('');
      } else {
        toast({ title: 'Welcome!' });
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    const { error } = await sendOtp(formData.phone);
    setIsLoading(false);
    
    if (error) {
      toast({ 
        title: 'Failed to resend OTP',
        description: error.message,
        variant: 'destructive' 
      });
    } else {
      toast({ title: 'OTP resent!' });
      setResendTimer(60);
      setOtpValue('');
    }
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
            {step === 'phone' ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-foreground">
                    Sign In with Phone
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Enter your phone number to receive an OTP
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-4">
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

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 bg-secondary rounded-md border border-input text-sm text-muted-foreground">
                        +91
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                        placeholder="10 digit number"
                        maxLength={10}
                        className={`flex-1 ${errors.phone ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Send OTP
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <button
                    onClick={() => {
                      setStep('phone');
                      setOtpValue('');
                    }}
                    className="absolute left-8 top-8 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-foreground">
                    Verify OTP
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Enter the 6-digit code sent to +91 {formData.phone}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpValue}
                      onChange={(value) => setOtpValue(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button 
                    onClick={handleVerifyOtp} 
                    className="w-full" 
                    disabled={isLoading || otpValue.length !== 6}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Verify & Sign In
                  </Button>

                  <div className="text-center">
                    <button
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || isLoading}
                      className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                    >
                      {resendTimer > 0 
                        ? `Resend OTP in ${resendTimer}s` 
                        : 'Resend OTP'}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setStep('phone');
                      setOtpValue('');
                    }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Change phone number
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
