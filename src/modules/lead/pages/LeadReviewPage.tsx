import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/shared/components/AppHeader";
import { useCampaignStore } from "@/modules/campaign/store/campaignStore";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { LeadForm, type LeadFormData } from "@/modules/lead/components/LeadForm";
import type { CaptureMethod } from "@/shared/types/erpnext";
import { enqueueLead } from "@/offline/syncQueue";
import { checkDuplicate, createLead, addComment, uploadFile } from "@/modules/lead/api/leadApi";

export default function LeadReviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeCampaign = useCampaignStore((s) => s.activeCampaign);
  const { client, session } = useAuthStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialData = location.state as Partial<LeadFormData> & { 
    captureMethod?: CaptureMethod,
    _imageBlob?: Blob 
  } | null;

  if (!initialData || !activeCampaign) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <AppHeader title={t("lead.review") || "Review Lead"} showBack />
        <p className="p-6 text-sm text-[#A0A0A0]">{t("common.noData")}</p>
      </div>
    );
  }

  const handleSubmit = async (data: LeadFormData) => {
    if (!client) {
      alert("You are not logged in.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Duplicate detection if online
      if (navigator.onLine && data.email_id) {
        const duplicate = await checkDuplicate(client, activeCampaign.campaign_name, data.email_id);
        if (duplicate) {
          const proceed = window.confirm(`A lead with this email already exists in this campaign (${duplicate.lead_name}). Continue anyway?`);
          if (!proceed) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      const payload = {
        lead_name: data.lead_name,
        company_name: data.company_name,
        email_id: data.email_id,
        mobile_no: data.mobile_no,
        phone: data.phone,
        job_title: data.job_title,
        website: data.website,
        source: "Campaign" as const,
        campaign_name: activeCampaign.campaign_name,
        custom_captured_via: initialData.captureMethod,
      };

      if (!navigator.onLine) {
        // Enqueue if offline
        await enqueueLead(payload, data.notes, initialData._imageBlob);
        alert(t("lead.savedOffline") || "Saved offline — will sync when online.");
        navigate("/");
        return;
      }

      // Try straight through if online
      try {
        const newLead = await createLead(client, payload);
        
        if (data.notes) {
          await addComment(client, {
            reference_name: newLead.name,
            content: data.notes,
            comment_email: session!.email,
            comment_by: session!.full_name
          });
        }

        if (initialData._imageBlob) {
          await uploadFile(client, newLead.name, initialData._imageBlob);
        }

        alert(t("lead.savedSuccess") || `Lead saved — ${newLead.lead_name}`);
        navigate("/");
      } catch (apiErr: any) {
        // Enqueue due to server issue (e.g., 500)
        console.error("API error, queuing up.", apiErr);
        await enqueueLead(payload, data.notes, initialData._imageBlob);
        alert(t("lead.savedOffline") || "Saved offline — will sync when online.");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <AppHeader
        title={t("lead.review") || "Review Lead"}
        showBack
        campaignName={activeCampaign?.campaign_name}
        onCampaignClick={() => navigate("/campaigns")}
      />

      {initialData.captureMethod && (
        <div className="px-6 py-4 border-b border-border bg-surface-alt flex items-center justify-between">
          <span className="text-xs text-[#A0A0A0] font-medium uppercase tracking-wider">
            {t("lead.capturedVia") || "Captured Via"}
          </span>
          <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            {initialData.captureMethod}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-4">
        <LeadForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
}
