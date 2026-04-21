import Dexie, { type Table } from "dexie";
import type { LeadPayload, CaptureMethod } from "@/shared/types/erpnext";

export interface SessionRow {
  id: "current";
  encrypted: string;
  iv: string;
}

export interface CryptoKeyRow {
  id: "master";
  keyData: ArrayBuffer;
}

export interface CampaignRow {
  name: string;
  campaign_name: string;
  start_date?: string;
  description?: string;
  modified: string;
}

export interface PendingLeadRow {
  id?: number;
  campaign_name: string;
  payload: LeadPayload;
  notes?: string;
  imageBlob?: Blob;
  status: "pending" | "in_flight" | "failed" | "completed";
  attempts: number;
  last_error?: string;
  created_at: string;
}

export interface RecentLeadRow {
  name: string;
  campaign_name: string;
  lead_name: string;
  company_name?: string;
  email_id?: string;
  mobile_no?: string;
  owner: string;
  creation: string;
  custom_captured_via?: CaptureMethod;
}

export interface ActiveCampaignRow {
  id: "active";
  campaign_name: string;
}

class BcScannerDB extends Dexie {
  session!: Table<SessionRow, string>;
  cryptoKey!: Table<CryptoKeyRow, string>;
  campaigns!: Table<CampaignRow, string>;
  pendingLeads!: Table<PendingLeadRow, number>;
  recentLeads!: Table<RecentLeadRow, string>;
  activeCampaign!: Table<ActiveCampaignRow, string>;

  constructor() {
    super("bc_scanner");
    this.version(1).stores({
      session: "id",
      cryptoKey: "id",
      campaigns: "name, campaign_name, modified",
      pendingLeads: "++id, campaign_name, status, created_at",
      recentLeads: "name, campaign_name, creation",
      activeCampaign: "id",
    });
  }
}

export const db = new BcScannerDB();
