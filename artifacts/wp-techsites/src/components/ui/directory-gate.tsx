import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DirectoryGateProps {
  themeName?: string;
}

const DIRECTORY_THEMES = [
  'MyListing', 'ListingPro', 'Listify', 'Listivo',
  'Houzez', 'Directorist', 'GeoDirectory', 'Listdom',
];

export function DirectoryGate({ themeName }: DirectoryGateProps) {
  return (
    <Card className="border-orange-500/30 bg-orange-50/30 dark:bg-orange-950/10">
      <CardContent className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5">
          <Lock className="w-7 h-7 text-orange-500" />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          Ferramenta exclusiva para sites de diretório
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          Esta ferramenta publica listings diretamente no WordPress — requer um{' '}
          <strong>tema ou plugin de diretório</strong> ativo no seu site.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {DIRECTORY_THEMES.map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full border border-orange-500/20 text-xs text-muted-foreground bg-background font-medium"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-muted/50 border border-border text-left max-w-sm w-full space-y-2">
          <p className="text-xs font-semibold text-foreground">Como ativar:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
            <li>Instale o tema MyListing, ListingPro ou Listify <em>— ou —</em></li>
            <li>Ative o plugin Directorist ou GeoDirectory</li>
            <li>O dashboard detecta automaticamente e libera as ferramentas</li>
          </ol>
        </div>

        {themeName && (
          <p className="text-xs text-muted-foreground mt-5">
            Tema detectado:{' '}
            <strong className="text-foreground">{themeName}</strong>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
