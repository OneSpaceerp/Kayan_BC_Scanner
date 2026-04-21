import { clsx } from "clsx";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = "md", className, label = "Loading…" }: LoadingSpinnerProps) {
  const sizes = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-2", lg: "h-12 w-12 border-[3px]" };
  return (
    <span role="status" aria-label={label} className={clsx("inline-flex", className)}>
      <span
        className={clsx(
          "animate-spin rounded-full border-brand border-t-transparent",
          sizes[size]
        )}
        aria-hidden
      />
    </span>
  );
}
