import { db, type PendingLeadRow } from "@/offline/db";
import { createLead, addComment, uploadFile } from "@/modules/lead/api/leadApi";
import { type AxiosInstance } from "axios";

export async function enqueueLead(
  payload: PendingLeadRow["payload"],
  notes?: string,
  imageBlob?: Blob
): Promise<void> {
  await db.pendingLeads.add({
    campaign_name: payload.campaign_name,
    payload,
    notes,
    imageBlob,
    status: "pending",
    attempts: 0,
    created_at: new Date().toISOString(),
  });

  // Attempt to sync immediately if online
  if (navigator.onLine) {
    // Fire and forget; backgroundSync usually picks it up
    triggerSync().catch(console.error);
  }
}

// Background or manual sync function
export async function triggerSync(client?: AxiosInstance) {
  // Try flushing queue here. For Milestone 9.
  // ... to be implemented completely ...
}
