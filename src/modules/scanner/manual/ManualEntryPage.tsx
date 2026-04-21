import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/shared/components/AppHeader";
import { LeadForm, type LeadFormData } from "@/modules/lead/components/LeadForm";

export default function ManualEntryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = (data: LeadFormData) => {
    navigate("/lead/review", {
      state: {
        captureMethod: "Manual",
        ...data
      },
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <AppHeader title={t("scanner.hub.manual") || "Manual Entry"} showBack />
      <div className="flex-1 overflow-y-auto">
        <LeadForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
