import { clsx } from "clsx";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className
      )}
    >
      {icon && (
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt text-brand">
          {icon}
        </span>
      )}
      <div className="space-y-1">
        <p className="text-base font-semibold text-white">{title}</p>
        {description && <p className="text-sm text-[#A0A0A0]">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
