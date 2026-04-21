import { clsx } from "clsx";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import type { Campaign } from "@/shared/types/erpnext";

interface CampaignPickerProps {
  campaigns: Campaign[];
  activeName?: string;
  onSelect: (campaign: Campaign) => void;
}

export function CampaignPicker({ campaigns, activeName, onSelect }: CampaignPickerProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? ar : enUS;

  if (campaigns.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#A0A0A0]">{t("campaign.noCampaigns")}</p>
    );
  }

  return (
    <ul className="divide-y divide-border" role="listbox" aria-label={t("campaign.title")}>
      {campaigns.map((c) => {
        const isActive = c.name === activeName;
        return (
          <li key={c.name}>
            <button
              role="option"
              aria-selected={isActive}
              onClick={() => onSelect(c)}
              className={clsx(
                "flex w-full items-center gap-3 px-4 py-4 text-start transition-colors",
                "hover:bg-surface-alt focus-visible:outline-none focus-visible:bg-surface-alt",
                isActive && "bg-brand/5"
              )}
            >
              <div className="flex-1 min-w-0">
                <p
                  className={clsx(
                    "truncate text-sm font-semibold",
                    isActive ? "text-brand" : "text-white"
                  )}
                >
                  {c.campaign_name}
                </p>
                {c.start_date && (
                  <p className="mt-0.5 text-xs text-[#A0A0A0]">
                    {format(new Date(c.start_date), "d MMM yyyy", { locale })}
                  </p>
                )}
              </div>
              {isActive && <CheckCircle className="h-5 w-5 shrink-0 text-brand" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
