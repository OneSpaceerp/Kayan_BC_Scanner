import type { AxiosInstance } from "axios";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { LeadPayload, LeadRecord } from "@/shared/types/erpnext";

export interface AddCommentInput {
  reference_name: string;
  content: string;
  comment_email: string;
  comment_by: string;
}

export interface UploadFileResult {
  file_url: string;
  name: string;
}

// ─── Create Lead ─────────────────────────────────────────────────────────────

export async function createLead(
  client: AxiosInstance,
  payload: Omit<LeadPayload, "_notes" | "_imageBlob">
): Promise<LeadRecord> {
  const res = await client.post<{ data: LeadRecord }>(ENDPOINTS.leads, payload);
  return res.data.data;
}

// ─── Add Comment ─────────────────────────────────────────────────────────────

export async function addComment(
  client: AxiosInstance,
  input: AddCommentInput
): Promise<void> {
  const body = new URLSearchParams({
    reference_doctype: "Lead",
    reference_name: input.reference_name,
    content: input.content,
    comment_email: input.comment_email,
    comment_by: input.comment_by,
  });
  await client.post(ENDPOINTS.addComment, body);
}

// ─── Upload File ─────────────────────────────────────────────────────────────

export async function uploadFile(
  client: AxiosInstance,
  leadName: string,
  imageBlob: Blob,
  fileName = "card.jpg"
): Promise<UploadFileResult> {
  const form = new FormData();
  form.append("file", imageBlob, fileName);
  form.append("doctype", "Lead");
  form.append("docname", leadName);
  form.append("is_private", "0");
  const res = await client.post<{ message: UploadFileResult }>(ENDPOINTS.uploadFile, form);
  return res.data.message;
}

// ─── Duplicate Check ─────────────────────────────────────────────────────────

export async function checkDuplicate(
  client: AxiosInstance,
  campaignName: string,
  email: string
): Promise<LeadRecord | null> {
  const res = await client.get<{ data: LeadRecord[] }>(ENDPOINTS.leads, {
    params: {
      filters: JSON.stringify([
        ["campaign_name", "=", campaignName],
        ["email_id", "=", email],
      ]),
      fields: JSON.stringify(["name", "lead_name"]),
      limit_page_length: 1,
    },
  });
  return res.data.data[0] ?? null;
}

// ─── Recent Leads ─────────────────────────────────────────────────────────────

export async function listRecentLeads(
  client: AxiosInstance,
  campaignName: string
): Promise<LeadRecord[]> {
  const res = await client.get<{ data: LeadRecord[] }>(ENDPOINTS.leads, {
    params: {
      filters: JSON.stringify([["campaign_name", "=", campaignName]]),
      fields: JSON.stringify([
        "name",
        "lead_name",
        "company_name",
        "email_id",
        "mobile_no",
        "owner",
        "creation",
        "custom_captured_via",
      ]),
      order_by: "creation desc",
      limit_page_length: 50,
    },
  });
  return res.data.data;
}
