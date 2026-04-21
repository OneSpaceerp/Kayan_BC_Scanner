import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";

const phoneRegex = /^(?:\+?20|0)?1[0125]\d{8}$|^(?:\+?966|0)?5\d{8}$|^\+?[\d\s\-()]{7,}$/;

const schema = z.object({
  lead_name: z.string().min(1, "Name is required"),
  company_name: z.string().optional(),
  job_title: z.string().optional(),
  email_id: z.string().email("Invalid email").optional().or(z.literal("")),
  mobile_no: z.string().regex(phoneRegex, "Invalid phone").optional().or(z.literal("")),
  phone: z.string().regex(phoneRegex, "Invalid phone").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
}).refine((data) => !!data.email_id || !!data.mobile_no || !!data.phone, {
  message: "At least one contact method (Email or Phone) is required",
  path: ["email_id"],
});

export type LeadFormData = z.infer<typeof schema>;

interface LeadFormProps {
  initialData?: Partial<LeadFormData>;
  onSubmit: (data: LeadFormData) => void;
  isSubmitting?: boolean;
}

export function LeadForm({ initialData, onSubmit, isSubmitting }: LeadFormProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      lead_name: initialData?.lead_name || "",
      company_name: initialData?.company_name || "",
      job_title: initialData?.job_title || "",
      email_id: initialData?.email_id || "",
      mobile_no: initialData?.mobile_no || "",
      phone: initialData?.phone || "",
      website: initialData?.website || "",
      notes: initialData?.notes || "",
    }
  });

  return (
    <form id="lead-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6">
      <div>
        <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">{t("lead.name") || "Full Name"} *</label>
        <input {...register("lead_name")} className="w-full bg-transparent border-b border-border text-white py-2 focus:border-brand outline-none transition-colors" />
        {errors.lead_name && <p className="text-brand text-xs mt-1 font-medium">{errors.lead_name.message}</p>}
      </div>
      <div>
        <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">{t("lead.company") || "Company"}</label>
        <input {...register("company_name")} className="w-full bg-transparent border-b border-border text-white py-2 focus:border-brand outline-none transition-colors" />
      </div>
      <div>
        <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">{t("lead.jobTitle") || "Job Title"}</label>
        <input {...register("job_title")} className="w-full bg-transparent border-b border-border text-white py-2 focus:border-brand outline-none transition-colors" />
      </div>
      <div>
        <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">{t("lead.email") || "Email ID"} *</label>
        <input {...register("email_id")} className="w-full bg-transparent border-b border-border text-white py-2 focus:border-brand outline-none transition-colors" />
        {errors.email_id && <p className="text-brand text-xs mt-1 font-medium">{errors.email_id.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">{t("lead.mobile") || "Mobile No"}</label>
          <input {...register("mobile_no")} className="w-full bg-transparent border-b border-border text-white py-2 focus:border-brand outline-none transition-colors" />
          {errors.mobile_no && <p className="text-brand text-xs mt-1 font-medium">{errors.mobile_no.message}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">{t("lead.phone") || "Phone/Landline"}</label>
          <input {...register("phone")} className="w-full bg-transparent border-b border-border text-white py-2 focus:border-brand outline-none transition-colors" />
          {errors.phone && <p className="text-brand text-xs mt-1 font-medium">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">{t("lead.website") || "Website"}</label>
        <input {...register("website")} className="w-full bg-transparent border-b border-border text-white py-2 focus:border-brand outline-none transition-colors" />
        {errors.website && <p className="text-brand text-xs mt-1 font-medium">{errors.website.message}</p>}
      </div>
      <div className="pt-2">
        <label className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">{t("lead.notes") || "Notes / Next Steps"}</label>
        <textarea {...register("notes")} rows={4} className="w-full bg-surface-alt rounded-lg p-3 text-white focus:outline-brand border border-border mt-2 transition-all resize-none shadow-inner" placeholder="E.g., Interested in early access..." />
      </div>
      <button 
        type="submit" 
        disabled={isSubmitting} 
        className="w-full bg-brand hover:bg-brand-hover active:scale-[0.98] transition-all text-white py-3.5 rounded-full font-bold shadow-lg shadow-brand/20 mt-6 disabled:opacity-50"
      >
        {isSubmitting ? t("common.loading") || "Saving..." : t("lead.submit") || "Save Lead"}
      </button>
    </form>
  );
}
