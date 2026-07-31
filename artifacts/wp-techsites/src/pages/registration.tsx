import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useRegisterWpSite, useVerifyWpSite } from '@workspace/api-client-react';
import { saveApiKey, getWpApiHeaders } from '@/lib/api-headers';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

export default function RegistrationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  
  const [existingKey, setExistingKey] = useState('');

  const registerMutation = useRegisterWpSite({
    mutation: {
      onSuccess: (data) => {
        saveApiKey(data.apiKey);
        toast({
          title: 'Account Created!',
          description: `Welcome! You've been granted ${data.credits} credits on the ${data.plan} plan.`,
        });
        setLocation('/dashboard');
      },
      onError: (error) => {
        toast({
          title: 'Registration Failed',
          description: error.message || 'Please check your details and try again.',
          variant: 'destructive',
        });
      },
    },
  });

  const verifyMutation = useVerifyWpSite({
    query: {
      enabled: false,
      queryKey: ['verify-wp-site'],
    },
    request: {
      headers: getWpApiHeaders(),
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      data: {
        email,
        name: name || undefined,
        siteUrl,
        siteName: siteName || undefined,
      },
    });
  };

  const handleVerifyExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!existingKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your API key.',
        variant: 'destructive',
      });
      return;
    }

    // Save key temporarily to test it
    saveApiKey(existingKey);
    
    try {
      const result = await verifyMutation.refetch();
      if (result.data) {
        toast({
          title: 'Connected Successfully!',
          description: `Welcome back to ${result.data.siteName}`,
        });
        setLocation('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Invalid API Key',
        description: 'The key you entered is not valid. Please check and try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 animate-slide-in-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Welcome to WP TechSites</h1>
          <p className="text-muted-foreground text-lg">
            AI-powered tools for your WordPress site
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>
              Get started with AI content generation, brand customization, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl">WordPress Site URL *</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  placeholder="https://yoursite.com"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  required
                  data-testid="input-site-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  type="text"
                  placeholder="My Awesome Site"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  data-testid="input-site-name"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account & Get API Key'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Already have an API key?
            </span>
          </div>
        </div>

        {/* Existing Key Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connect Existing Account</CardTitle>
            <CardDescription>
              If you already have a WP TechSites API key, enter it here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyExisting} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="existingKey">API Key</Label>
                <Input
                  id="existingKey"
                  type="text"
                  placeholder="wpts_..."
                  value={existingKey}
                  onChange={(e) => setExistingKey(e.target.value)}
                  data-testid="input-existing-key"
                  className="font-mono text-sm"
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={verifyMutation.isFetching}
                data-testid="button-verify-key"
              >
                {verifyMutation.isFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Connect with API Key'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
