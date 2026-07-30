import { useParams, useLocation } from 'wouter';
import { useI18n } from '@/lib/i18n';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  useGetMeeting, 
  useListMeetingSessions,
  useDeleteMeeting,
  getGetMeetingQueryKey,
  getListMeetingSessionsQueryKey,
  getListMeetingsQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Play, Edit, Trash2, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function MeetingDetailContent() {
  const params = useParams();
  const meetingId = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: meeting, isLoading: meetingLoading } = useGetMeeting(meetingId, {
    query: { enabled: !!meetingId, queryKey: getGetMeetingQueryKey(meetingId) }
  });

  const { data: sessions, isLoading: sessionsLoading } = useListMeetingSessions(meetingId, {
    query: { enabled: !!meetingId, queryKey: getListMeetingSessionsQueryKey(meetingId) }
  });

  const deleteMeeting = useDeleteMeeting();

  const handleDelete = async () => {
    try {
      await deleteMeeting.mutateAsync({ meetingId });
      await queryClient.invalidateQueries({ queryKey: getListMeetingsQueryKey() });
      toast({ title: t('meeting.deleted') });
      setLocation('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('meeting.failDelete');
      toast({ title: t('common.error'), description: errorMessage, variant: 'destructive' });
    }
  };

  if (meetingLoading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-primary font-mono">{t('meeting.loading')}</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive text-xl">{t('meeting.notFound')}</p>
          <Button onClick={() => setLocation('/dashboard')}>{t('meeting.backDashboard')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black text-foreground">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="mb-6 text-muted-foreground hover:text-primary" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('meeting.backDashboard')}
          </Button>

          {/* Meeting Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold matrix-text" data-testid="text-meeting-title">{meeting.title}</h1>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {meeting.language.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{meeting.description || t('meeting.noDesc')}</p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground font-mono">
                {meeting.company && <span>{t('meeting.companyLabel')}<span className="text-foreground">{meeting.company}</span></span>}
                <span>{t('meeting.aiLabel')}<span className="text-primary">{meeting.aiName}</span></span>
                <span>{meeting.sessionCount || 0} {t('meeting.sessionsLabel')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow" data-testid="button-start-session">
                <a href={`/meetings/${meetingId}/live`}>
                  <Play className="w-4 h-4 mr-2" />
                  {t('meeting.startSession')}
                </a>
              </Button>

              <Button variant="outline" className="border-muted hover:border-primary" data-testid="button-edit">
                <Edit className="w-4 h-4" />
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10" data-testid="button-delete">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-primary/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('meeting.deleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('meeting.deleteDescPre')}"{meeting.title}"{t('meeting.deleteDescPost')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Resources */}
          <Card className="bg-card/50 border-primary/20 p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">{t('meeting.resources')}</h2>
            <div className="flex flex-wrap gap-2">
              {(meeting.resources ?? []).map((resource) => (
                <Badge key={resource} variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {resource}
                </Badge>
              ))}
            </div>
            {meeting.briefingText && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <p className="text-sm text-muted-foreground font-mono">{meeting.briefingText}</p>
              </div>
            )}
          </Card>

          {/* Sessions History */}
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('meeting.history')}</h2>
            
            {sessionsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-card/50 border-primary/20 p-6 animate-pulse">
                    <div className="h-4 bg-primary/20 rounded w-1/4 mb-2" />
                    <div className="h-3 bg-primary/20 rounded w-1/2" />
                  </Card>
                ))}
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="bg-card/50 border-primary/20 p-6 terminal-glow hover:border-primary/40 transition-all" data-testid={`card-session-${session.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={session.status === 'active' ? 'default' : 'outline'} className={session.status === 'active' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                            {session.status}
                          </Badge>
                          {session.durationMinutes && (
                            <span className="text-sm text-muted-foreground font-mono">
                              {session.durationMinutes} {t('meeting.minutes')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
                          </span>
                          {session.endedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {t('meeting.endedAt')}{formatDistanceToNow(new Date(session.endedAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        {session.summary && (
                          <p className="text-sm text-muted-foreground mt-2">{session.summary}</p>
                        )}
                        {session.builtAssets && session.builtAssets.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-primary/20">
                            <p className="text-xs text-muted-foreground mb-2 font-mono">{t('meeting.builtAssets')}</p>
                            <div className="flex flex-wrap gap-2">
                              {(session.builtAssets?.split('\n') ?? []).filter(Boolean).map((asset, i) => (
                                <Badge key={i} variant="outline" className="bg-secondary/10 text-secondary border-secondary/30 text-xs font-mono">
                                  {asset}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/50 border-primary/20 p-12 text-center">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">{t('meeting.noSessions')}</h3>
                <p className="text-muted-foreground mb-6">{t('meeting.startFirst')}</p>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href={`/meetings/${meetingId}/live`}>
                    <Play className="w-4 h-4 mr-2" />
                    {t('meeting.startSession')}
                  </a>
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MeetingDetail() {
  return (
    <ProtectedRoute>
      <MeetingDetailContent />
    </ProtectedRoute>
  );
}
