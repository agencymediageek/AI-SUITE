import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
}

export function MediaGeekLogo({ className, size = "md", variant = "full" }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" },
  };
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Icon — stylized "MG" with lightning */}
      <svg width={s.icon} height={s.icon} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mg-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        {/* Background rounded square */}
        <rect width="32" height="32" rx="8" fill="url(#mg-grad)" />
        {/* Lightning bolt / arrow shape */}
        <path
          d="M18 4L10 16h7l-3 12 12-14h-7L18 4z"
          fill="white"
          fillOpacity="0.95"
        />
      </svg>

      {variant === "full" && (
        <span className={cn("font-extrabold tracking-tight leading-none", s.text)}>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Media</span>
          <span className="text-foreground">Geek</span>
        </span>
      )}
    </div>
  );
}
