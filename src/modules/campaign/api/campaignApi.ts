import type { AxiosInstance } from "axios";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { Campaign } from "@/shared/types/erpnext";

export interface CreateCampaignInput {
  campaign_name: string;
  start_date?: string;
  description?: string;
}

export async function listCampaigns(client: AxiosInstance): Promise<Campaign[]> {
  const res = await client.get<{ data: Campaign[] }>(ENDPOINTS.campaigns, {
    params: {
      fields: JSON.stringify(["name", "campaign_name", "modified"]),
      order_by: "modified desc",
      limit_page_length: 50,
    },
  });
  return res.data.data;
}

export async function createCampaign(
  client: AxiosInstance,
  input: CreateCampaignInput
): Promise<Campaign> {
  const res = await client.post<{ data: Campaign }>(ENDPOINTS.campaigns, input);
  return res.data.data;
}
