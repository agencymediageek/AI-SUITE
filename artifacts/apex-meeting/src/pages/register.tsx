import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MatrixGlobe } from '@/components/meeting/MatrixGlobe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { useRegisterUser } from '@workspace/api-client-react';
import { useAuthStore } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuthStore();
  const { t } = useI18n();
  const { toast } = useToast();
  const register = useRegisterUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsProcessing(true);
    try {
      const response = await register.mutateAsync({ data });
      setToken(response.token);
      toast({ title: 'Account created', description: 'Welcome to APEX CORE' });
      setLocation('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast({ title: 'Registration failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-foreground relative overflow-hidden flex items-center justify-center">
      {/* Background Matrix Globe */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <MatrixGlobe size={800} isProcessing={false} />
      </div>

      {/* Scan lines */}
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="bg-card/90 backdrop-blur-xl border-primary/30 p-8 terminal-glow">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg mb-4">
              <UserPlus className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold matrix-text mb-2">{t('register.title')}</h1>
            <p className="text-muted-foreground">Join the executive command center</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">{t('register.name')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Jane Smith"
                        className="bg-background/50 border-primary/30 focus:border-primary"
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">{t('login.email')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@company.com"
                        className="bg-background/50 border-primary/30 focus:border-primary"
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">{t('login.password')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="bg-background/50 border-primary/30 focus:border-primary"
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow"
                disabled={isProcessing}
                data-testid="button-submit"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  t('register.submit')
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('register.hasAccount')}{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium" data-testid="link-login">
                {t('register.signIn')}
              </Link>
            </p>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-home">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
