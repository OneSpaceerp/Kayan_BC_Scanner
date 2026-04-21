import type { ReactNode } from "react";
import { clsx } from "clsx";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useToast, type ToastItem, type ToastVariant } from "./toastStore";


const icons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle className="h-4 w-4 shrink-0" />,
  error: <XCircle className="h-4 w-4 shrink-0" />,
  info: <Info className="h-4 w-4 shrink-0" />,
};

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-[#10B981] text-white",
  error: "bg-brand text-white",
  info: "bg-surface-alt border border-border text-white",
};

function ToastItemView({ toast }: { toast: ToastItem }) {
  const dismiss = useToast((s) => s.dismiss);
  return (
    <div
      role="alert"
      aria-live="polite"
      className={clsx(
        "flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium",
        "animate-in slide-in-from-top duration-200",
        variantStyles[toast.variant]
      )}
    >
      {icons[toast.variant]}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss"
        className="rounded p-0.5 opacity-70 hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <ToastItemView toast={t} />
        </div>
      ))}
    </div>
  );
}
