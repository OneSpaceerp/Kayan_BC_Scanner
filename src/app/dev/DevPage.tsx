import { useState } from "react";
import { useTranslation } from "react-i18next";
import { QrCode, Wifi, WifiOff } from "lucide-react";
import { PrimaryButton } from "@/shared/components/PrimaryButton";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { EmptyState } from "@/shared/components/EmptyState";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { AppHeader, type SyncStatus } from "@/shared/components/AppHeader";
import { useToast } from "@/shared/components/toastStore";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";

export default function DevPage() {
  const { i18n, t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const toast = useToast((s) => s.show);
  const online = useOnlineStatus();
  const isRtl = i18n.language === "ar";

  const toggleLang = () => i18n.changeLanguage(isRtl ? "en" : "ar");
  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader
        title={t("app.name")}
        showMenu
        campaignName="Cairo Exhibition 2026"
        onCampaignClick={() => toast("Campaign chip clicked", "info")}
        syncStatus={syncStatus}
      />

      <div className="mx-auto max-w-lg space-y-10 p-6">

        {/* ── Language / RTL ── */}
        <Section label="Language / RTL">
          <PrimaryButton onClick={toggleLang} fullWidth={false}>
            {isRtl ? "Switch to English" : "التبديل إلى العربية"}
          </PrimaryButton>
          <p className="mt-2 text-xs text-[#A0A0A0]">
            dir=&ldquo;{isRtl ? "rtl" : "ltr"}&rdquo; on &lt;html&gt; ·{" "}
            {isRtl ? "Arabic font active" : "Latin font active"}
          </p>
        </Section>

        {/* ── Buttons ── */}
        <Section label="Buttons">
          <div className="space-y-3">
            <PrimaryButton variant="primary">Primary Button</PrimaryButton>
            <PrimaryButton variant="secondary">Secondary Button</PrimaryButton>
            <PrimaryButton variant="destructive">Destructive Button</PrimaryButton>
            <PrimaryButton loading onClick={simulateLoading}>
              Loading State
            </PrimaryButton>
            <PrimaryButton disabled>Disabled</PrimaryButton>
          </div>
        </Section>

        {/* ── Spinners ── */}
        <Section label="Loading Spinner">
          <div className="flex items-center gap-6">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>
          <div className="mt-3">
            <PrimaryButton onClick={simulateLoading} variant="secondary" fullWidth={false}>
              {loading ? <LoadingSpinner size="sm" label="Loading" /> : "Simulate loading"}
            </PrimaryButton>
          </div>
        </Section>

        {/* ── Toasts ── */}
        <Section label="Toasts">
          <div className="flex flex-wrap gap-2">
            <PrimaryButton
              onClick={() => toast(t("lead.saved", { name: "Ahmed Hassan" }), "success")}
              variant="primary"
              fullWidth={false}
            >
              Success
            </PrimaryButton>
            <PrimaryButton
              onClick={() => toast(t("auth.errors.invalidCredentials"), "error")}
              variant="destructive"
              fullWidth={false}
            >
              Error
            </PrimaryButton>
            <PrimaryButton
              onClick={() => toast(t("lead.savedOffline"), "info")}
              variant="secondary"
              fullWidth={false}
            >
              Info
            </PrimaryButton>
          </div>
        </Section>

        {/* ── Sync badge ── */}
        <Section label="Sync Badge (header dot)">
          <div className="flex flex-wrap gap-2">
            {(["synced", "pending", "failed"] as SyncStatus[]).map((s) => (
              <PrimaryButton
                key={s}
                onClick={() => setSyncStatus(s)}
                variant={syncStatus === s ? "primary" : "secondary"}
                fullWidth={false}
              >
                {s}
              </PrimaryButton>
            ))}
          </div>
        </Section>

        {/* ── Empty state ── */}
        <Section label="Empty State">
          <div className="rounded-xl border border-border">
            <EmptyState
              icon={<QrCode className="h-8 w-8" />}
              title={t("common.noData")}
              description="No leads captured yet in this campaign."
              action={
                <PrimaryButton fullWidth={false} variant="secondary">
                  Capture first card
                </PrimaryButton>
              }
            />
          </div>
        </Section>

        {/* ── Online status ── */}
        <Section label="Online Status Hook">
          <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
            {online ? (
              <Wifi className="h-5 w-5 text-[#10B981]" />
            ) : (
              <WifiOff className="h-5 w-5 text-brand" />
            )}
            <span className="text-sm">{online ? "Online" : "Offline"}</span>
          </div>
        </Section>

        {/* ── Bottom sheet ── */}
        <Section label="Bottom Sheet">
          <PrimaryButton onClick={() => setSheetOpen(true)} fullWidth={false}>
            Open sheet
          </PrimaryButton>
          <BottomSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title={t("campaign.newCampaign")}
          >
            <p className="mb-4 text-sm text-[#A0A0A0]">
              Backdrop click or Escape to close.
            </p>
            <PrimaryButton onClick={() => setSheetOpen(false)}>Close</PrimaryButton>
          </BottomSheet>
        </Section>

        {/* ── i18n keys ── */}
        <Section label="i18n Keys Sample">
          <div className="space-y-1 rounded-xl border border-border p-4 text-sm">
            {(
              [
                "app.name",
                "auth.login",
                "campaign.title",
                "scanner.hub.title",
                "lead.submit",
                "sync.title",
                "settings.title",
                "common.offline",
              ] as const
            ).map((key) => (
              <div key={key} className="flex justify-between gap-4">
                <span className="font-mono text-[#A0A0A0] text-xs">{key}</span>
                <span className="text-right text-xs">{t(key)}</span>
              </div>
            ))}
          </div>
        </Section>

        <div className="h-20" />
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#A0A0A0]">
        {label}
      </h2>
      {children}
    </section>
  );
}
