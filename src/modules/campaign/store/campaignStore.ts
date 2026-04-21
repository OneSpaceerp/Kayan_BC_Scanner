import { create } from "zustand";
import { db } from "@/offline/db";
import type { Campaign } from "@/shared/types/erpnext";

interface CampaignState {
  activeCampaign: Campaign | null;
  setActive: (campaign: Campaign) => Promise<void>;
  clearActive: () => Promise<void>;
  restore: () => Promise<void>;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  activeCampaign: null,

  setActive: async (campaign) => {
    await db.activeCampaign.put({ id: "active", campaign_name: campaign.name });
    set({ activeCampaign: campaign });
  },

  clearActive: async () => {
    await db.activeCampaign.delete("active");
    set({ activeCampaign: null });
  },

  restore: async () => {
    const row = await db.activeCampaign.get("active");
    if (!row) return;
    // Look up full campaign object from local cache
    const campaign = await db.campaigns.get(row.campaign_name);
    if (campaign) set({ activeCampaign: campaign });
  },
}));
