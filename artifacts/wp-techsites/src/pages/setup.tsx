import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle2, Download, Upload, Key, Settings } from 'lucide-react';
import { getApiKey } from '@/lib/api-headers';
import { useToast } from '@/hooks/use-toast';

export default function SetupPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const apiKey = getApiKey();

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      toast({
        title: 'API Key Copied',
        description: 'Paste this into your WordPress plugin settings.',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 animate-slide-in-up">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Plugin Setup Guide</h1>
          <p className="text-muted-foreground">
            Follow these steps to connect your WordPress site to WP TechSites AI tools.
          </p>
        </div>

        {/* API Key Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-primary" />
              <CardTitle>Your API Key</CardTitle>
            </div>
            <CardDescription>
              Copy this key to connect your WordPress site. Keep it secure — don't share it publicly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <code className="flex-1 px-4 py-3 bg-muted rounded-lg text-sm font-mono text-foreground break-all">
                {apiKey || 'No API key found'}
              </code>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                data-testid="button-copy-api-key"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-chart-3" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Installation Steps */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Installation Steps</h2>
          
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Badge className="w-8 h-8 flex items-center justify-center rounded-full">1</Badge>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">Download the Plugin</CardTitle>
                  <CardDescription className="mb-4">
                    Get the latest version of the WP TechSites plugin for WordPress.
                  </CardDescription>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="default"
                      data-testid="button-download-plugin"
                      asChild
                    >
                      <a
                        href="/api/plugins/wp-techsites-plugin-v2.4.1.zip"
                        download="wp-techsites-plugin-v2.4.1.zip"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download v2.4.1 — Latest (wp-techsites.zip)
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      v2.4.1 inclui: conexão 1 clique, chatbot IA, auditoria SEO, scraping BrightData, editor AI e gerador de logo.
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Badge className="w-8 h-8 flex items-center justify-center rounded-full">2</Badge>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">Upload to WordPress</CardTitle>
                  <CardDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-3 text-sm">
                      <li>Log in to your WordPress admin panel</li>
                      <li>Navigate to <strong>Plugins → Add New → Upload Plugin</strong></li>
                      <li>Choose the downloaded <strong>wp-techsites-plugin-v2.4.1.zip</strong> file</li>
                      <li>Click <strong>Install Now</strong> and wait for the upload to complete</li>
                      <li>Click <strong>Activate Plugin</strong></li>
                    </ol>
                  </CardDescription>
                </div>
                <Upload className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Badge className="w-8 h-8 flex items-center justify-center rounded-full">3</Badge>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">Enter Your API Key</CardTitle>
                  <CardDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-3 text-sm">
                      <li>Go to <strong>Settings → WP TechSites</strong> in your WordPress admin</li>
                      <li>Paste your API key (copied above) into the API Key field</li>
                      <li>Click <strong>Save Changes</strong></li>
                      <li>You'll see a green "Connected" status when successful</li>
                    </ol>
                  </CardDescription>
                </div>
                <Settings className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </CardHeader>
          </Card>

          <Card className="border-chart-3/30 bg-chart-3/5">
            <CardHeader>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-chart-3 flex-shrink-0 mt-1" />
                <div>
                  <CardTitle className="text-lg mb-2">You're All Set!</CardTitle>
                  <CardDescription>
                    Once connected, you'll be able to use all WP TechSites AI tools directly from your WordPress admin panel. 
                    Changes you make here in the dashboard will sync with your site automatically.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Support Section */}
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-base">Need Help?</CardTitle>
            <CardDescription>
              If you encounter issues during installation, check our documentation or contact support at{' '}
              <a href="mailto:support@techsites.ai" className="text-primary hover:underline">
                support@techsites.ai
              </a>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </DashboardShell>
  );
}
