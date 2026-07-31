import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  name: string;
  icon: string;
  credits: number;
  available: boolean;
  onClick?: () => void;
  className?: string;
}

const iconMap: Record<string, string> = {
  'content': '📝',
  'colors': '🎨',
  'menu': '📋',
  'chat': '💬',
  'seo': '🔍',
  'images': '🖼️',
};

export function ToolCard({ name, icon, credits, available, onClick, className }: ToolCardProps) {
  const emoji = iconMap[icon] || icon;

  return (
    <Card 
      className={cn(
        'border-card-border transition-all hover:shadow-md',
        !available && 'opacity-60',
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{emoji}</div>
          {!available && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">{name}</h3>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {credits} {credits === 1 ? 'credit' : 'credits'}
          </Badge>
          
          {available ? (
            <Button
              size="sm"
              onClick={onClick}
              data-testid={`button-use-${name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              Use Tool
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled
              data-testid={`button-locked-${name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              Upgrade
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
