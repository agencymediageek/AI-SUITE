import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  icon: string;
  text: string;
}

interface ToolInfoCardProps {
  steps: Step[];
  result: {
    label: string;
    color?: 'blue' | 'green' | 'orange' | 'purple' | 'yellow';
    detail?: string;
  };
  className?: string;
}

const colorMap = {
  blue:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  green:  'bg-green-500/10 text-green-400 border-green-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export function ToolInfoCard({ steps, result, className }: ToolInfoCardProps) {
  const color = result.color ?? 'blue';
  const badge = colorMap[color];

  return (
    <div className={cn(
      'rounded-xl border border-primary/10 bg-primary/[0.03] px-4 py-3.5',
      'flex flex-col sm:flex-row sm:items-start gap-3',
      className,
    )}>
      {/* Icon */}
      <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
        <Info className="w-3.5 h-3.5 text-primary" />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-primary/70 uppercase tracking-wider mb-2">
          Como funciona
        </p>
        <ol className="space-y-1 mb-3">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-snug">
              <span className="shrink-0 text-sm leading-none">{s.icon}</span>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>

        {/* Result badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-muted-foreground">Resultado:</span>
          <span className={cn(
            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold',
            badge,
          )}>
            {result.label}
          </span>
          {result.detail && (
            <span className="text-[11px] text-muted-foreground">{result.detail}</span>
          )}
        </div>
      </div>
    </div>
  );
}
