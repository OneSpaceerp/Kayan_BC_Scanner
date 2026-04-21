import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/shared/components/AppHeader";
import { useCampaignStore } from "@/modules/campaign/store/campaignStore";
import type { BusinessCardData } from "@/shared/types/businessCard";

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 px-6 py-3 border-b border-border">
      <p className="text-xs font-medium text-[#A0A0A0]">{label}</p>
      <p className="text-sm text-white break-all">{value}</p>
    </div>
  );
}

export default function LeadReviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const activeCampaign = useCampaignStore((s) => s.activeCampaign);

  const cardData = location.state as BusinessCardData | null;

  if (!cardData) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <AppHeader title={t("lead.review")} showBack />
        <p className="p-6 text-sm text-[#A0A0A0]">{t("common.noData")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <AppHeader
        title={t("lead.review")}
        showBack
        campaignName={activeCampaign?.campaign_name}
        onCampaignClick={() => navigate("/campaigns")}
      />

      <div className="flex-1 overflow-y-auto divide-y divide-border">
        <Field label={t("lead.name")} value={cardData.lead_name} />
        <Field label={t("lead.company")} value={cardData.company_name} />
        <Field label={t("lead.jobTitle")} value={cardData.job_title} />
        <Field label={t("lead.email")} value={cardData.email_id} />
        <Field label={t("lead.mobile")} value={cardData.mobile_no} />
        <Field label={t("lead.phone")} value={cardData.phone} />
        <Field label={t("lead.website")} value={cardData.website} />
        <Field label={t("lead.notes")} value={cardData.notes} />

        {/* Capture method badge */}
        <div className="px-6 py-3">
          <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            {t("lead.capturedVia")}: {cardData.captureMethod}
          </span>
        </div>
      </div>

      {/* Full Lead Review form comes in M8 */}
      <div className="border-t border-border p-4">
        <p className="text-center text-sm text-[#A0A0A0]">
          {t("lead.submit")} — {t("common.loading")} (Milestone 8)
        </p>
      </div>
    </div>
  );
}
