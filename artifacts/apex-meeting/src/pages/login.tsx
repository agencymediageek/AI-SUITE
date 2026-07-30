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
import { useLoginUser } from '@workspace/api-client-react';
import { useAuthStore } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuthStore();
  const { t } = useI18n();
  const { toast } = useToast();
  const login = useLoginUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsProcessing(true);
    try {
      const response = await login.mutateAsync({ data });
      setToken(response.token);
      toast({ title: t('login.success.title'), description: t('login.success.desc') });
      setLocation('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('login.error.default');
      toast({ title: t('login.error.title'), description: errorMessage, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-foreground relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <MatrixGlobe size={800} isProcessing={false} />
      </div>
      <div className="scan-lines fixed inset-0 pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="bg-card/90 backdrop-blur-xl border-primary/30 p-8 terminal-glow">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg mb-4">
              <LogIn className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold matrix-text mb-2">{t('login.title')}</h1>
            <p className="text-muted-foreground">{t('login.subtitle')}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    {t('login.loading')}
                  </>
                ) : (
                  t('login.submit')
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('login.noAccount')}{' '}
              <Link href="/register" className="text-primary hover:text-primary/80 font-medium" data-testid="link-register">
                {t('login.signUp')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
