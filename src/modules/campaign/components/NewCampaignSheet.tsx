import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { clsx } from "clsx";
import { BottomSheet } from "@/shared/components/BottomSheet";
import { PrimaryButton } from "@/shared/components/PrimaryButton";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { useCreateCampaign } from "@/modules/campaign/hooks/useCampaigns";
import type { Campaign } from "@/shared/types/erpnext";

const schema = z.object({
  campaign_name: z.string().min(1, "required"),
  start_date: z.string().min(1, "required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface NewCampaignSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated: (campaign: Campaign) => void;
}

export function NewCampaignSheet({ open, onClose, onCreated }: NewCampaignSheetProps) {
  const { t } = useTranslation();
  const online = useOnlineStatus();
  const { mutateAsync, isPending } = useCreateCampaign();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      campaign_name: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      description: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    const campaign = await mutateAsync({
      campaign_name: values.campaign_name,
      start_date: values.start_date,
      description: values.description || undefined,
    });
    reset();
    onCreated(campaign);
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title={t("campaign.newCampaign")}>
      {!online ? (
        <div className="rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#F59E0B]">
          {t("campaign.offlineBlocked")}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Campaign name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#A0A0A0]">
              {t("campaign.campaignName")}
              <span className="ms-1 text-brand">*</span>
            </label>
            <input
              {...register("campaign_name")}
              type="text"
              placeholder={t("campaign.campaignName")}
              className={fieldClass(!!errors.campaign_name)}
            />
            {errors.campaign_name && (
              <p className="text-xs text-brand">{t("lead.required")}</p>
            )}
          </div>

          {/* Start date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#A0A0A0]">
              {t("campaign.startDate")}
              <span className="ms-1 text-brand">*</span>
            </label>
            <input
              {...register("start_date")}
              type="date"
              className={clsx(fieldClass(!!errors.start_date), "text-white [color-scheme:dark]")}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#A0A0A0]">
              {t("campaign.description")}
            </label>
            <textarea
              {...register("description")}
              rows={2}
              className={clsx(fieldClass(false), "resize-none")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <PrimaryButton
              type="button"
              variant="secondary"
              onClick={handleClose}
              fullWidth
            >
              {t("common.cancel")}
            </PrimaryButton>
            <PrimaryButton type="submit" loading={isPending} fullWidth>
              {isPending ? t("campaign.creating") : t("campaign.create")}
            </PrimaryButton>
          </div>
        </form>
      )}
    </BottomSheet>
  );
}

function fieldClass(hasError: boolean) {
  return clsx(
    "w-full rounded-xl border bg-surface px-4 py-3 text-sm text-white placeholder-[#A0A0A0]",
    "outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 focus:ring-offset-surface-alt",
    hasError ? "border-brand" : "border-border"
  );
}
