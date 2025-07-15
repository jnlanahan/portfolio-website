import { useState } from 'react';
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
import { Key, Shield, RefreshCw, Info, AlertTriangle } from 'lucide-react';

const recoverySchema = z.object({
  recoveryKey: z.string().min(1, 'Recovery key is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RecoveryFormData = z.infer<typeof recoverySchema>;

export default function AdminRecoveryPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("info");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryFormData>({
    resolver: zodResolver(recoverySchema),
  });

  // Fetch recovery information
  const { data: recoveryInfo } = useQuery({
    queryKey: ["/api/admin/recovery-info"],
  });

  // Generate recovery key mutation
  const generateKeyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/generate-recovery-key", "POST");
    },
    onSuccess: (data) => {
      toast({
        title: "Recovery key generated",
        description: "Save this key securely. You'll need it if you forget your password.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate recovery key",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Password recovery mutation
  const recoveryMutation = useMutation({
    mutationFn: async (data: RecoveryFormData) => {
      return await apiRequest("/api/admin/recover", "POST", {
        recoveryKey: data.recoveryKey,
        newPassword: data.newPassword,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Password reset initiated",
        description: "Check the server logs for instructions to complete the reset.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password recovery failed",
        description: error.message || "Invalid recovery key or other error",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RecoveryFormData) => {
    recoveryMutation.mutate(data);
  };

  const generatedKey = generateKeyMutation.data;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Shield className="w-6 h-6" />
            Admin Account Recovery
          </CardTitle>
          <CardDescription>
            Recover access to your admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Instructions</TabsTrigger>
              <TabsTrigger value="generate">Generate Recovery Key</TabsTrigger>
              <TabsTrigger value="recover">Recover Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Password Recovery Options:</strong>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Option 1: Manual Recovery (Recommended)</h4>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                      <li>Go to your Replit Secrets panel</li>
                      <li>Generate a new password</li>
                      <li>Run: <code className="bg-blue-100 px-1 rounded">node scripts/hash-password.js [your-new-password]</code></li>
                      <li>Update ADMIN_PASSWORD secret with the hashed value</li>
                      <li>Restart your application</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Option 2: Recovery Key Method</h4>
                    <ol className="list-decimal list-inside space-y-1 text-green-800">
                      <li>Generate a recovery key using the "Generate Recovery Key" tab</li>
                      <li>Store the recovery key securely</li>
                      <li>Add ADMIN_RECOVERY_KEY to your Replit Secrets</li>
                      <li>Use the "Recover Password" tab when needed</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Option 3: Complete Reset</h4>
                    <ol className="list-decimal list-inside space-y-1 text-yellow-800">
                      <li>Delete ADMIN_PASSWORD and ADMIN_USERNAME secrets</li>
                      <li>Re-run the initial setup process</li>
                      <li>Create new credentials from scratch</li>
                    </ol>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="generate" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    Generate a secure recovery key for future password recovery. Store this key safely!
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={() => generateKeyMutation.mutate()}
                  disabled={generateKeyMutation.isPending}
                  className="w-full"
                >
                  {generateKeyMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  Generate Recovery Key
                </Button>
                
                {generatedKey && (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Important:</strong> Save these values securely. The recovery key will be needed to recover your password.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="recoveryKey">Recovery Key (Save this securely)</Label>
                        <Input
                          id="recoveryKey"
                          value={generatedKey.recoveryKey}
                          readOnly
                          className="font-mono text-sm"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="hashedKey">Hashed Key (Add to ADMIN_RECOVERY_KEY secret)</Label>
                        <Textarea
                          id="hashedKey"
                          value={generatedKey.hashedKey}
                          readOnly
                          className="font-mono text-sm h-20"
                        />
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-2">
                        <p><strong>Next steps:</strong></p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Copy the recovery key above and store it securely</li>
                          <li>Copy the hashed key above</li>
                          <li>Go to Replit Secrets and add ADMIN_RECOVERY_KEY with the hashed value</li>
                          <li>Restart your application</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="recover" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Use your recovery key to reset your admin password. Rate limited to 3 attempts per hour.
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recoveryKey">Recovery Key</Label>
                    <Input
                      id="recoveryKey"
                      type="text"
                      placeholder="Enter your recovery key"
                      {...register("recoveryKey")}
                      className={errors.recoveryKey ? "border-red-500" : ""}
                    />
                    {errors.recoveryKey && (
                      <p className="text-sm text-red-500">{errors.recoveryKey.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      {...register("newPassword")}
                      className={errors.newPassword ? "border-red-500" : ""}
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      {...register("confirmPassword")}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={recoveryMutation.isPending}
                  >
                    {recoveryMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    Reset Password
                  </Button>
                </form>
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