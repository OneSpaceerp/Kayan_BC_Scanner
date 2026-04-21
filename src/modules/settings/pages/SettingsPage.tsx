import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useCampaignStore } from "@/modules/campaign/store/campaignStore";
import { AppHeader } from "@/shared/components/AppHeader";
import { PrimaryButton } from "@/shared/components/PrimaryButton";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const activeCampaign = useCampaignStore((s) => s.activeCampaign);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const toggleLang = () => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader
        title={t("settings.title")}
        showBack
        campaignName={activeCampaign?.campaign_name}
        onCampaignClick={() => navigate("/campaigns")}
      />
      <div className="mx-auto max-w-lg divide-y divide-border">

        {/* Account */}
        {session && (
          <Row label={t("settings.user")}>
            <p className="font-medium text-white">{session.full_name}</p>
            <p className="text-xs text-[#A0A0A0]">{session.email}</p>
          </Row>
        )}

        {/* Server */}
        {session && (
          <Row label={t("settings.server")}>
            <p className="break-all font-mono text-xs text-[#A0A0A0]">{session.server_url}</p>
          </Row>
        )}

        {/* Active campaign */}
        <Row label={t("campaign.active")}>
          {activeCampaign ? (
            <button
              onClick={() => navigate("/campaigns")}
              className="text-sm text-brand hover:underline text-start"
            >
              {activeCampaign.campaign_name}
            </button>
          ) : (
            <button
              onClick={() => navigate("/campaigns")}
              className="text-sm text-[#A0A0A0] hover:text-white"
            >
              {t("common.noData")} — tap to select
            </button>
          )}
        </Row>

        {/* Language */}
        <Row label={t("settings.language")}>
          <button
            onClick={toggleLang}
            className="text-sm text-brand hover:underline"
          >
            {i18n.language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          </button>
        </Row>

        {/* Version */}
        <Row label={t("settings.version")}>
          <p className="text-sm text-[#A0A0A0]">{import.meta.env.VITE_APP_VERSION ?? "1.0.0"}</p>
        </Row>

        {/* Logout */}
        <div className="p-6">
          <PrimaryButton variant="destructive" onClick={handleLogout}>
            {t("settings.logout")}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-6 py-4">
      <p className="text-xs font-medium text-[#A0A0A0]">{label}</p>
      {children}
    </div>
  );
}
