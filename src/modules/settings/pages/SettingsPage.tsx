import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { AppHeader } from "@/shared/components/AppHeader";
import { PrimaryButton } from "@/shared/components/PrimaryButton";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader title={t("settings.title")} showBack />
      <div className="mx-auto max-w-lg space-y-6 p-6">
        {session && (
          <div className="rounded-xl border border-border p-4 text-sm space-y-2">
            <p className="text-[#A0A0A0]">{t("settings.user")}</p>
            <p className="font-medium">{session.full_name}</p>
            <p className="text-[#A0A0A0] text-xs">{session.email}</p>
          </div>
        )}
        {session && (
          <div className="rounded-xl border border-border p-4 text-sm space-y-2">
            <p className="text-[#A0A0A0]">{t("settings.server")}</p>
            <p className="font-mono text-xs break-all">{session.server_url}</p>
          </div>
        )}
        <PrimaryButton variant="destructive" onClick={handleLogout}>
          {t("settings.logout")}
        </PrimaryButton>
      </div>
    </div>
  );
}
