import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { AppHeader } from "@/shared/components/AppHeader";
import { PrimaryButton } from "@/shared/components/PrimaryButton";

export default function CampaignSelectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader title={t("campaign.title")} />
      <div className="mx-auto max-w-lg p-6 space-y-4">
        {session && (
          <p className="text-sm text-[#A0A0A0]">
            Logged in as <span className="text-white font-medium">{session.full_name}</span>
            {" "}({session.email})
          </p>
        )}
        <p className="text-sm text-[#A0A0A0]">
          Full campaign UI coming in Milestone 5.
        </p>
        <PrimaryButton onClick={() => navigate("/")}>
          Continue to Scanner Hub →
        </PrimaryButton>
        <PrimaryButton variant="secondary" onClick={() => navigate("/settings")}>
          Settings / Logout
        </PrimaryButton>
      </div>
    </div>
  );
}
