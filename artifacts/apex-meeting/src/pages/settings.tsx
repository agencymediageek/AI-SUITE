import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  useGetWhiteLabel, 
  useUpdateWhiteLabel,
  getGetWhiteLabelQueryKey 
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';
import { Save, Palette } from 'lucide-react';

type WhiteLabelForm = {
  aiName: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  companyName?: string;
  subdomain?: string;
};

function SettingsContent() {
  const { t } = useI18n();

  const whiteLabelSchema = useMemo(() => z.object({
    aiName: z.string().min(2, t('settings.valid.aiName')),
    logoUrl: z.string().url(t('settings.valid.url')).optional().or(z.literal('')),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, t('settings.valid.color')),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, t('settings.valid.color')),
    companyName: z.string().optional(),
    subdomain: z.string().regex(/^[a-z0-9-]*$/, t('settings.valid.subdomain')).optional().or(z.literal('')),
  }), [t]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: whiteLabel, isLoading } = useGetWhiteLabel({
    query: { queryKey: getGetWhiteLabelQueryKey() }
  });
  const updateWhiteLabel = useUpdateWhiteLabel();

  const form = useForm<WhiteLabelForm>({
    resolver: zodResolver(whiteLabelSchema),
    defaultValues: {
      aiName: whiteLabel?.aiName || 'APEX CORE',
      logoUrl: whiteLabel?.logoUrl || '',
      primaryColor: whiteLabel?.primaryColor || '#00FF41',
      accentColor: whiteLabel?.accentColor || '#00FFFF',
      companyName: whiteLabel?.companyName || '',
      subdomain: whiteLabel?.subdomain || '',
    },
  });

  const onSubmit = async (data: WhiteLabelForm) => {
    try {
      await updateWhiteLabel.mutateAsync({ data });
      await queryClient.invalidateQueries({ queryKey: getGetWhiteLabelQueryKey() });
      toast({ title: t('settings.saved'), description: t('settings.saved.desc') });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('settings.error.save');
      toast({ title: t('common.error'), description: errorMessage, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-primary font-mono">{t('settings.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black text-foreground">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold matrix-text mb-2">{t('settings.title')}</h1>
            <p className="text-muted-foreground">{t('settings.subtitle')}</p>
          </div>

          <Card className="bg-card/50 border-primary/20 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Palette className="w-6 h-6 text-primary" />
                {t('settings.whiteLabel')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('settings.whiteLabel.desc')}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="aiName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.aiName')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="APEX CORE" className="bg-background/50" data-testid="input-ai-name" />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {t('settings.aiName.desc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.companyName')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('settings.companyName')} className="bg-background/50" data-testid="input-company-name" />
                        </FormControl>
                        <FormDescription className="text-xs">
                          {t('settings.companyName.desc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.logoUrl')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://example.com/logo.png" className="bg-background/50" data-testid="input-logo-url" />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {t('settings.logoUrl.desc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.primaryColor')}</FormLabel>
                        <div className="flex gap-3">
                          <FormControl>
                            <Input {...field} type="color" className="bg-background/50 w-20 h-10 p-1 cursor-pointer" data-testid="input-primary-color" />
                          </FormControl>
                          <FormControl>
                            <Input {...field} type="text" placeholder="#00FF41" className="bg-background/50 flex-1 font-mono" />
                          </FormControl>
                        </div>
                        <FormDescription className="text-xs">
                          {t('settings.primaryColor.desc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.accentColor')}</FormLabel>
                        <div className="flex gap-3">
                          <FormControl>
                            <Input {...field} type="color" className="bg-background/50 w-20 h-10 p-1 cursor-pointer" data-testid="input-accent-color" />
                          </FormControl>
                          <FormControl>
                            <Input {...field} type="text" placeholder="#00FFFF" className="bg-background/50 flex-1 font-mono" />
                          </FormControl>
                        </div>
                        <FormDescription className="text-xs">
                          {t('settings.accentColor.desc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('settings.subdomain')}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input {...field} placeholder="your-company" className="bg-background/50 font-mono flex-1" data-testid="input-subdomain" />
                          <span className="text-muted-foreground text-sm">{t('settings.subdomain.suffix')}</span>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        {t('settings.subdomain.desc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow"
                    disabled={updateWhiteLabel.isPending}
                    data-testid="button-save"
                  >
                    {updateWhiteLabel.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                        {t('settings.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {t('settings.save')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
