import { forwardRef } from "react";
import { clsx } from "clsx";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "destructive";
}

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ children, loading, fullWidth = true, variant = "primary", className, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl font-medium text-sm transition-all duration-100 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none";

    const variants = {
      primary: "bg-brand text-white hover:bg-brand-hover active:bg-brand-pressed",
      secondary:
        "bg-transparent text-white border border-border hover:bg-surface-alt active:bg-surface-alt",
      destructive: "bg-brand-deep text-white hover:opacity-90 active:opacity-80",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={clsx(base, variants[variant], fullWidth && "w-full", className)}
        {...props}
      >
        {loading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        )}
        {children}
      </button>
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";
