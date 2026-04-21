export interface ERPNextSession {
  server_url: string;
  email: string;
  full_name: string;
  api_key: string;
  api_secret: string;
  created_at: string;
}

export interface Campaign {
  name: string;
  campaign_name: string;
  start_date?: string;
  description?: string;
  modified?: string;
}

export type CaptureMethod = "QR" | "OCR" | "Manual";

export interface LeadPayload {
  lead_name: string;
  company_name?: string;
  email_id?: string;
  mobile_no?: string;
  phone?: string;
  job_title?: string;
  website?: string;
  source: "Campaign";
  campaign_name: string;
  custom_captured_via?: CaptureMethod;
  _notes?: string;
  _imageBlob?: Blob;
}

export interface LeadRecord extends LeadPayload {
  name: string;
  owner: string;
  creation: string;
}
