import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Key, Shield, RefreshCw, Info, AlertTriangle, Mail, HelpCircle } from 'lucide-react';

const initiateRecoverySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  securityAnswers: z.array(z.string()).length(5, 'All 5 security questions must be answered'),
});

const verifyRecoverySchema = z.object({
  token: z.string().min(1, 'Recovery token is required'),
  securityAnswers: z.array(z.string()).length(5, 'All 5 security questions must be answered'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type InitiateRecoveryFormData = z.infer<typeof initiateRecoverySchema>;
type VerifyRecoveryFormData = z.infer<typeof verifyRecoverySchema>;

export default function AdminRecoveryPage() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("info");
  const [recoveryStep, setRecoveryStep] = useState<'initiate' | 'verify'>('initiate');
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  // Check if we're on the verify route and extract token from URL
  const isVerifyRoute = location.startsWith('/admin/recovery/verify');
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');

  // Auto-switch to verify tab if token is in URL
  useEffect(() => {
    if (isVerifyRoute && tokenFromUrl) {
      setActiveTab('verify');
      setRecoveryStep('verify');
      setEmailSent(true);
    }
  }, [isVerifyRoute, tokenFromUrl]);

  const {
    register: registerInitiate,
    handleSubmit: handleInitiateSubmit,
    formState: { errors: initiateErrors },
    reset: resetInitiate,
  } = useForm<InitiateRecoveryFormData>({
    resolver: zodResolver(initiateRecoverySchema),
    defaultValues: {
      email: '',
      securityAnswers: ['', '', '', '', ''],
    },
  });

  const {
    register: registerVerify,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
    setValue: setVerifyValue,
  } = useForm<VerifyRecoveryFormData>({
    resolver: zodResolver(verifyRecoverySchema),
    defaultValues: {
      token: '',
      securityAnswers: ['', '', '', '', ''],
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Pre-fill token from URL if available
  useEffect(() => {
    if (tokenFromUrl) {
      setVerifyValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, setVerifyValue]);

  // Fetch recovery information
  const { data: recoveryInfo } = useQuery({
    queryKey: ["/api/admin/recovery-info"],
  });

  // Fetch security questions
  const { data: securityQuestions } = useQuery({
    queryKey: ["/api/admin/security-questions"],
  });

  // Initiate recovery mutation
  const initiateRecoveryMutation = useMutation({
    mutationFn: async (data: InitiateRecoveryFormData) => {
      return await apiRequest("/api/admin/initiate-recovery", "POST", {
        email: data.email,
        securityAnswers: data.securityAnswers,
      });
    },
    onSuccess: (data) => {
      setEmailSent(true);
      setRecoveryStep('verify');
      toast({
        title: "Recovery email sent",
        description: "Check your email for the recovery link and token.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send recovery email",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Verify recovery mutation
  const verifyRecoveryMutation = useMutation({
    mutationFn: async (data: VerifyRecoveryFormData) => {
      return await apiRequest("/api/admin/verify-recovery", "POST", {
        token: data.token,
        securityAnswers: data.securityAnswers,
        newPassword: data.newPassword,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Password reset successful",
        description: "Check the server logs for instructions to complete the reset.",
      });
      setRecoveryStep('initiate');
      setEmailSent(false);
      resetInitiate();
    },
    onError: (error: any) => {
      toast({
        title: "Password recovery failed",
        description: error.message || "Invalid token or incorrect security answers",
        variant: "destructive",
      });
    },
  });

  const onInitiateSubmit = (data: InitiateRecoveryFormData) => {
    initiateRecoveryMutation.mutate(data);
  };

  const onVerifySubmit = (data: VerifyRecoveryFormData) => {
    verifyRecoveryMutation.mutate(data);
  };

  const questions = securityQuestions?.questions || [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Shield className="w-6 h-6" />
            Admin Account Recovery
          </CardTitle>
          <CardDescription>
            Secure password recovery using email verification and security questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Instructions</TabsTrigger>
              <TabsTrigger value="initiate">Step 1: Request Recovery</TabsTrigger>
              <TabsTrigger value="verify">Step 2: Verify & Reset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Email-Based Recovery with Multi-Factor Authentication</strong>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Step 1: Email Verification</h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Enter your admin email address</li>
                      <li>Answer all 5 security questions</li>
                      <li>System sends recovery token to your email</li>
                      <li>Token expires in 30 minutes for security</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Step 2: Security Questions</h4>
                    <ul className="list-disc list-inside space-y-1 text-green-800">
                      <li>Enter the recovery token from your email</li>
                      <li>Answer all 5 security questions again</li>
                      <li>At least 2 out of 5 answers must match</li>
                      <li>Set your new password</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Security Questions:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-purple-800">
                      {questions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Manual Recovery (Backup)</h4>
                    <p className="text-yellow-800">
                      If you can't access your email, use: <code className="bg-yellow-100 px-1 rounded">node scripts/hash-password.js [new-password]</code>
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="initiate" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Enter your email and answer all security questions to receive a recovery token.
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={handleInitiateSubmit(onInitiateSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Admin Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your admin email"
                      {...registerInitiate("email")}
                      className={initiateErrors.email ? "border-red-500" : ""}
                    />
                    {initiateErrors.email && (
                      <p className="text-sm text-red-500">{initiateErrors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Security Questions</Label>
                    {questions.map((question, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`securityAnswer${index}`} className="text-sm">
                          {index + 1}. {question}
                        </Label>
                        <Input
                          id={`securityAnswer${index}`}
                          type="text"
                          placeholder="Your answer"
                          {...registerInitiate(`securityAnswers.${index}` as const)}
                          className={initiateErrors.securityAnswers?.[index] ? "border-red-500" : ""}
                        />
                        {initiateErrors.securityAnswers?.[index] && (
                          <p className="text-sm text-red-500">{initiateErrors.securityAnswers[index]?.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={initiateRecoveryMutation.isPending}
                  >
                    {initiateRecoveryMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Send Recovery Email
                  </Button>
                </form>
                
                {emailSent && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Email sent!</strong> Check your inbox for the recovery token. The token expires in 30 minutes.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="verify" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Enter the recovery token from your email and verify your identity with security questions.
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={handleVerifySubmit(onVerifySubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="token">Recovery Token</Label>
                    <Input
                      id="token"
                      type="text"
                      placeholder="Enter token from email"
                      {...registerVerify("token")}
                      className={verifyErrors.token ? "border-red-500" : ""}
                    />
                    {verifyErrors.token && (
                      <p className="text-sm text-red-500">{verifyErrors.token.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Security Questions (Answer All)</Label>
                    {questions.map((question, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`verifyAnswer${index}`} className="text-sm">
                          {index + 1}. {question}
                        </Label>
                        <Input
                          id={`verifyAnswer${index}`}
                          type="text"
                          placeholder="Your answer"
                          {...registerVerify(`securityAnswers.${index}` as const)}
                          className={verifyErrors.securityAnswers?.[index] ? "border-red-500" : ""}
                        />
                        {verifyErrors.securityAnswers?.[index] && (
                          <p className="text-sm text-red-500">{verifyErrors.securityAnswers[index]?.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      {...registerVerify("newPassword")}
                      className={verifyErrors.newPassword ? "border-red-500" : ""}
                    />
                    {verifyErrors.newPassword && (
                      <p className="text-sm text-red-500">{verifyErrors.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      {...registerVerify("confirmPassword")}
                      className={verifyErrors.confirmPassword ? "border-red-500" : ""}
                    />
                    {verifyErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{verifyErrors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={verifyRecoveryMutation.isPending}
                  >
                    {verifyRecoveryMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    Verify & Reset Password
                  </Button>
                </form>
                
                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> At least 2 out of 5 security answers must match your original answers. Answers are case-insensitive.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/admin/login")}
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}