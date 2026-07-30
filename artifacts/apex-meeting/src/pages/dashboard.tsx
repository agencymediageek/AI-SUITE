import { Link } from 'wouter';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  useListMeetings, 
  useGetMeetingsOverview,
  getListMeetingsQueryKey,
  getGetMeetingsOverviewQueryKey 
} from '@workspace/api-client-react';
import { useI18n } from '@/lib/i18n';
import { Plus, Video, Clock, Activity, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function DashboardContent() {
  const { t } = useI18n();
  const { data: meetings, isLoading: meetingsLoading } = useListMeetings({
    query: { queryKey: getListMeetingsQueryKey() }
  });
  const { data: overview, isLoading: overviewLoading } = useGetMeetingsOverview({
    query: { queryKey: getGetMeetingsOverviewQueryKey() }
  });

  const activeMeetings = meetings?.filter(m => m.status === 'active') || [];

  return (
    <div className="min-h-[100dvh] bg-black text-foreground">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold matrix-text mb-2">{t('dashboard.title')}</h1>
              <p className="text-muted-foreground">Manage your AI-powered meetings</p>
            </div>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 terminal-glow" data-testid="button-new-meeting">
              <Link href="/meetings/new">
                <Plus className="w-4 h-4 mr-2" />
                {t('dashboard.newMeeting')}
              </Link>
            </Button>
          </div>

          {/* Overview Stats */}
          {overviewLoading ? (
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-card/50 border-primary/20 p-6 animate-pulse">
                  <div className="h-4 bg-primary/20 rounded w-24 mb-4" />
                  <div className="h-8 bg-primary/20 rounded w-16" />
                </Card>
              ))}
            </div>
          ) : overview ? (
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card className="bg-card/50 border-primary/20 p-6 terminal-glow hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground font-mono uppercase">{t('dashboard.totalMeetings')}</p>
                  <Video className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold matrix-text font-mono" data-testid="text-total-meetings">{overview.totalMeetings}</p>
              </Card>

              <Card className="bg-card/50 border-primary/20 p-6 terminal-glow hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground font-mono uppercase">{t('dashboard.totalSessions')}</p>
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-3xl font-bold cyan-text font-mono" data-testid="text-total-sessions">{overview.totalSessions}</p>
              </Card>

              <Card className="bg-card/50 border-primary/20 p-6 terminal-glow hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground font-mono uppercase">{t('dashboard.activeSessions')}</p>
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold matrix-text font-mono" data-testid="text-active-sessions">{overview.activeSessions}</p>
              </Card>

              <Card className="bg-card/50 border-primary/20 p-6 terminal-glow hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground font-mono uppercase">{t('dashboard.avgDuration')}</p>
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-3xl font-bold cyan-text font-mono" data-testid="text-avg-duration">
                  {overview.avgDurationMinutes ? `${Math.round(overview.avgDurationMinutes)}m` : '—'}
                </p>
              </Card>
            </div>
          ) : null}

          {/* Meetings List */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">{t('dashboard.meetings')}</h2>
            
            {meetingsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-card/50 border-primary/20 p-6 animate-pulse">
                    <div className="h-6 bg-primary/20 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-primary/20 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-primary/20 rounded w-2/3" />
                  </Card>
                ))}
              </div>
            ) : activeMeetings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeMeetings.map((meeting) => (
                  <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                    <Card className="bg-card/50 border-primary/20 p-6 terminal-glow hover:border-primary/40 hover:scale-105 transition-all cursor-pointer group h-full" data-testid={`card-meeting-${meeting.id}`}>
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {meeting.title}
                        </h3>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {meeting.language.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {meeting.description || 'No description'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                        <div className="flex items-center gap-4">
                          <span>{meeting.sessionCount || 0} sessions</span>
                        </div>
                        {meeting.lastSessionAt && (
                          <span>{formatDistanceToNow(new Date(meeting.lastSessionAt), { addSuffix: true })}</span>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-primary/20">
                        <p className="text-xs text-muted-foreground">
                          AI: <span className="text-primary font-medium">{meeting.aiName}</span>
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="bg-card/50 border-primary/20 p-12 text-center">
                <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">No meetings yet</h3>
                <p className="text-muted-foreground mb-6">Create your first meeting room to get started</p>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/meetings/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Meeting
                  </Link>
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
