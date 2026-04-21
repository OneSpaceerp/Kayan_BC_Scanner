import { useEffect, useRef, type ReactNode } from "react";
import { clsx } from "clsx";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Trap focus when open
  useEffect(() => {
    if (open) sheetRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className={clsx(
          "relative z-10 w-full rounded-t-[16px] bg-surface-alt p-6 outline-none",
          "animate-in slide-in-from-bottom duration-200",
          className
        )}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden />
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
