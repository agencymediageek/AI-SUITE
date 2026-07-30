import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateMeeting, getListMeetingsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Zap } from 'lucide-react';

const meetingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  company: z.string().optional(),
  companyUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  aiName: z.string().min(2, 'AI name must be at least 2 characters'),
  language: z.enum(['pt', 'en', 'es']),
  resources: z.array(z.string()).min(1, 'Select at least one resource'),
  briefingText: z.string().optional(),
});

type MeetingForm = z.infer<typeof meetingSchema>;

const availableResources = [
  { id: 'voice', label: 'Voice Recognition', description: 'Speak commands during meetings' },
  { id: 'camera', label: 'Camera Feed', description: 'APEX CORE can see your screen' },
  { id: 'site-builder', label: 'Site Builder', description: 'Deploy websites in real-time' },
  { id: 'documents', label: 'Document Generation', description: 'Generate and publish documents' },
  { id: 'dns', label: 'DNS Configuration', description: 'Configure domains and DNS records' },
  { id: 'tools', label: 'Developer Tools', description: 'CI/CD, staging environments' },
];

function NewMeetingContent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMeeting = useCreateMeeting();

  const form = useForm<MeetingForm>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      description: '',
      company: '',
      companyUrl: '',
      logoUrl: '',
      aiName: 'APEX CORE',
      language: 'pt',
      resources: ['voice', 'site-builder'],
      briefingText: '',
    },
  });

  const onSubmit = async (data: MeetingForm) => {
    try {
      const meeting = await createMeeting.mutateAsync({ data });
      await queryClient.invalidateQueries({ queryKey: getListMeetingsQueryKey() });
      toast({ title: 'Meeting created', description: 'Your meeting room is ready' });
      setLocation(`/meetings/${meeting.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create meeting';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-foreground">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="mb-6 text-muted-foreground hover:text-primary" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold matrix-text mb-2">Configure New Meeting</h1>
            <p className="text-muted-foreground">Set up your AI-powered meeting room</p>
          </div>

          <Card className="bg-card/50 border-primary/20 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Q1 Strategy Session" className="bg-background/50" data-testid="input-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Acme Corp" className="bg-background/50" data-testid="input-company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Quarterly planning and execution review" className="bg-background/50 resize-none" rows={3} data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="aiName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Name (White-Label)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="APEX CORE" className="bg-background/50" data-testid="input-ai-name" />
                        </FormControl>
                        <FormDescription className="text-xs">Rename the AI to your brand identity</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50" data-testid="select-language">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pt">Português</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="resources"
                  render={() => (
                    <FormItem>
                      <FormLabel>Available Resources</FormLabel>
                      <FormDescription className="text-xs mb-4">Select tools APEX CORE can use during this meeting</FormDescription>
                      <div className="grid md:grid-cols-2 gap-4">
                        {availableResources.map((resource) => (
                          <FormField
                            key={resource.id}
                            control={form.control}
                            name="resources"
                            render={({ field }) => (
                              <FormItem className="flex items-start space-x-3 space-y-0 bg-background/30 p-4 rounded-lg border border-primary/20">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(resource.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      const updated = checked
                                        ? [...current, resource.id]
                                        : current.filter((id) => id !== resource.id);
                                      field.onChange(updated);
                                    }}
                                    data-testid={`checkbox-resource-${resource.id}`}
                                  />
                                </FormControl>
                                <div className="flex-1">
                                  <FormLabel className="text-sm font-medium cursor-pointer">{resource.label}</FormLabel>
                                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="briefingText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Briefing for AI</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Context: We're launching a new product line. The AI should focus on speed and automation." className="bg-background/50 resize-none" rows={4} data-testid="input-briefing" />
                      </FormControl>
                      <FormDescription className="text-xs">Optional context to guide AI behavior</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setLocation('/dashboard')} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow" disabled={createMeeting.isPending} data-testid="button-submit">
                    {createMeeting.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Create Meeting
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

export default function NewMeeting() {
  return (
    <ProtectedRoute>
      <NewMeetingContent />
    </ProtectedRoute>
  );
}
