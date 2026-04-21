import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { listCampaigns, createCampaign, type CreateCampaignInput } from "@/modules/campaign/api/campaignApi";
import { db } from "@/offline/db";
import type { Campaign } from "@/shared/types/erpnext";

export const CAMPAIGNS_KEY = ["campaigns"] as const;

export function useCampaignList() {
  const { client } = useAuth();

  return useQuery<Campaign[]>({
    queryKey: CAMPAIGNS_KEY,
    enabled: !!client,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      try {
        const campaigns = await listCampaigns(client!);
        // Write-through to IndexedDB for offline access
        if (campaigns.length > 0) {
          await db.campaigns.bulkPut(
            campaigns.map((c) => ({ ...c, modified: c.modified ?? "" }))
          );
        }
        return campaigns;
      } catch (err) {
        // Only use cached data for genuine network failures (no HTTP response).
        // HTTP errors (4xx/5xx) mean the server is reachable — rethrow them so
        // the UI can show the real error instead of the "offline" state.
        const hasResponse = isAxiosError(err) && err.response != null;
        if (hasResponse) throw err;

        const cached = await db.campaigns.orderBy("modified").reverse().toArray();
        if (cached.length > 0) return cached;
        throw new Error("OFFLINE_NO_CACHE");
      }
    },
  });
}

export function useCreateCampaign() {
  const { client } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCampaignInput) => createCampaign(client!, input),
    onSuccess: (newCampaign) => {
      // Optimistically insert into cache
      queryClient.setQueryData<Campaign[]>(CAMPAIGNS_KEY, (prev = []) => [
        newCampaign,
        ...prev,
      ]);
      // Persist to IndexedDB
      db.campaigns.put({ ...newCampaign, modified: newCampaign.modified ?? "" });
    },
  });
}
