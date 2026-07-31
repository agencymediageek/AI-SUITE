import { Link } from 'wouter';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { useI18n } from '@/lib/i18n';

export default function PaymentCancel() {
  const { t } = useI18n();

  return (
    <div className="min-h-[100dvh] bg-black text-foreground">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100dvh-80px)] px-4">
        <Card className="bg-card/50 border-red-500/20 p-10 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2 text-red-400">
              {t('payment.cancel.title')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('payment.cancel.desc')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              className="flex-1 border-primary/30 hover:border-primary/60"
            >
              <Link href="/pricing">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('payment.cancel.retry')}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-muted/30 hover:border-muted/60 text-muted-foreground"
            >
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('payment.cancel.cta')}
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
