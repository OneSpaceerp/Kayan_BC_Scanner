import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Search, WifiOff } from "lucide-react";
import { AppHeader } from "@/shared/components/AppHeader";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { EmptyState } from "@/shared/components/EmptyState";
import { CampaignPicker } from "@/modules/campaign/components/CampaignPicker";
import { NewCampaignSheet } from "@/modules/campaign/components/NewCampaignSheet";
import { useCampaignList } from "@/modules/campaign/hooks/useCampaigns";
import { useCampaignStore } from "@/modules/campaign/store/campaignStore";
import type { Campaign } from "@/shared/types/erpnext";

export default function CampaignSelectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const { activeCampaign, setActive } = useCampaignStore();
  const { data: campaigns = [], isLoading, error } = useCampaignList();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter((c) => c.campaign_name.toLowerCase().includes(q));
  }, [campaigns, search]);

  const handleSelect = async (campaign: Campaign) => {
    await setActive(campaign);
    navigate("/", { replace: true });
  };

  const handleCreated = async (campaign: Campaign) => {
    setSheetOpen(false);
    await setActive(campaign);
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <AppHeader title={t("campaign.title")} />

      {/* Search bar */}
      <div className="border-b border-border px-4 py-3">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0A0A0]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("campaign.search")}
            aria-label={t("campaign.search")}
            className="w-full rounded-xl border border-border bg-surface-alt py-2.5 ps-9 pe-4 text-sm text-white placeholder-[#A0A0A0] outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 focus:ring-offset-black"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="md" />
          </div>
        ) : error && campaigns.length === 0 ? (
          <EmptyState
            icon={<WifiOff className="h-8 w-8" />}
            title={t("common.offline")}
            description={t("campaign.noCampaigns")}
          />
        ) : (
          <CampaignPicker
            campaigns={filtered}
            activeName={activeCampaign?.name}
            onSelect={handleSelect}
          />
        )}
      </div>

      {/* New Campaign FAB */}
      <div className="border-t border-border p-4">
        <button
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium text-white transition-colors hover:border-brand hover:text-brand"
        >
          <Plus className="h-4 w-4" />
          {t("campaign.newCampaign")}
        </button>
      </div>

      <NewCampaignSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
