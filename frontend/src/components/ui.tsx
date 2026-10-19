import type { ReactNode, ComponentType } from "react";
import { clsx } from "clsx";

export function GlassCard({ className, children, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={clsx(
        "bg-glass-bg border border-glass-border rounded-xl backdrop-blur-sm shadow-glass",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    online: { label: "Online", color: "bg-success" },
    offline: { label: "Offline", color: "bg-danger" },
    starting: { label: "Starting", color: "bg-warning" },
    booting: { label: "Booting", color: "bg-warning" },
    stopping: { label: "Stopping", color: "bg-secondary" },
    crashed: { label: "Crashed", color: "bg-danger" },
  };
  const conf = config[status.toLowerCase()] || { label: status, color: "bg-muted" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${conf.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
      {conf.label}
    </span>
  );
}

export function RAMGauge({ used, max }: { used: number; max: number }) {
  const percentage = max > 0 ? (used / max) * 100 : 0;
  const percentageClamped = Math.min(percentage, 100);
  const isNearLimit = percentage >= 90;

  const getColor = () => {
    if (percentage >= 90) return "bg-danger";
    if (percentage >= 70) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted">
          RAM: {(used / (1024 ** 3)).toFixed(1)}G / ${(max / (1024 ** 3)).toFixed(1)}G
        </span>
        <span className={isNearLimit ? "text-danger font-bold" : "text-foreground"}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 bg-cardBorder rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${percentageClamped}%` }}
        />
      </div>
    </div>
  );
}

export function CPUGauge({ cpu }: { cpu: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted">CPU Usage</span>
        <span className="text-foreground">{cpu.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-cardBorder rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(cpu, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function ActionButton({
  onClick,
  variant = "primary",
  icon: Icon,
  children,
  disabled,
  className,
}: {
  onClick: () => void;
  variant?: "primary" | "danger" | "warning" | "secondary";
  icon: ComponentType<any>;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const variants = {
    primary: "bg-primary hover:bg-primaryHover border-primary/30",
    danger: "bg-danger hover:bg-danger/80 border-danger/30",
    warning: "bg-warning hover:bg-warning/80 border-warning/30",
    secondary: "bg-cardBorder hover:bg-cardBorder/70 border-cardBorder",
  };

  return (
  <button
    onClick={onClick}
    disabled={disabled}
    className={clsx(
      "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
      variants[variant],
      className
    )}
  >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}
