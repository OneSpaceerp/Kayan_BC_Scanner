import type { CaptureMethod } from "./erpnext";

export interface BusinessCardData {
  lead_name?: string;
  company_name?: string;
  job_title?: string;
  email_id?: string;
  mobile_no?: string;
  phone?: string;
  website?: string;
  notes?: string;
  captureMethod: CaptureMethod;
  rawText?: string;
  imageBlob?: Blob;
}
