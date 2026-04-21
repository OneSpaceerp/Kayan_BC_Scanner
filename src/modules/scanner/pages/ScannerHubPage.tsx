import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { QrCode, ScanLine, PenLine, Settings } from "lucide-react";
import { clsx } from "clsx";
import { AppHeader } from "@/shared/components/AppHeader";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export default function ScannerHubPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuth();

  const tiles = [
    { icon: QrCode, label: t("scanner.hub.qr"), to: "/scan/qr", ready: false },
    { icon: ScanLine, label: t("scanner.hub.ocr"), to: "/scan/ocr", ready: false },
    { icon: PenLine, label: t("scanner.hub.manual"), to: "/scan/manual", ready: false },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader
        title={t("scanner.hub.title")}
        campaignName="—"
        right={
          <button
            onClick={() => navigate("/settings")}
            aria-label="Settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-surface-alt"
          >
            <Settings className="h-5 w-5" />
          </button>
        }
      />

      <div className="mx-auto max-w-lg p-6">
        {session && (
          <p className="mb-6 text-sm text-[#A0A0A0]">
            {t("common.loading")} — Milestone 5 (campaign) and 6 (scanner) coming next.
          </p>
        )}
        <div className="grid grid-cols-1 gap-4">
          {tiles.map(({ icon: Icon, label, to, ready }) => (
            <button
              key={to}
              onClick={() => ready && navigate(to)}
              disabled={!ready}
              className={clsx(
                "flex items-center gap-4 rounded-2xl border border-border p-6 text-start transition-colors",
                ready
                  ? "hover:border-brand hover:bg-surface-alt cursor-pointer"
                  : "cursor-not-allowed opacity-40"
              )}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-base font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
