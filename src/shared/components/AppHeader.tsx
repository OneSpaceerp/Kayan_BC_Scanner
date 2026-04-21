import { ArrowLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import type { ReactNode } from "react";

export type SyncStatus = "synced" | "pending" | "failed";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  onMenu?: () => void;
  campaignName?: string;
  onCampaignClick?: () => void;
  syncStatus?: SyncStatus;
  right?: ReactNode;
  className?: string;
}

const syncDot: Record<SyncStatus, string> = {
  synced: "bg-[#10B981]",
  pending: "bg-[#F59E0B]",
  failed: "bg-brand",
};

export function AppHeader({
  title,
  showBack,
  onBack,
  showMenu,
  onMenu,
  campaignName,
  onCampaignClick,
  syncStatus,
  right,
  className,
}: AppHeaderProps) {
  const navigate = useNavigate();

  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <header
      className={clsx(
        "flex h-14 items-center gap-2 border-b border-border bg-black px-4",
        className
      )}
    >
      {/* Left */}
      <div className="flex w-10 shrink-0 items-center">
        {showBack && (
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-surface-alt"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {showMenu && (
          <button
            onClick={onMenu}
            aria-label="Open menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-surface-alt"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Center */}
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {title && (
          <span className="truncate text-base font-semibold text-white">{title}</span>
        )}
      </div>

      {/* Right */}
      <div className="flex w-fit shrink-0 items-center gap-2">
        {campaignName && (
          <button
            onClick={onCampaignClick}
            aria-label={`Active campaign: ${campaignName}`}
            className="flex max-w-[180px] items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-white"
          >
            <span className="truncate">{campaignName}</span>
          </button>
        )}
        {syncStatus && (
          <span
            aria-label={`Sync status: ${syncStatus}`}
            className={clsx("h-2 w-2 rounded-full", syncDot[syncStatus])}
          />
        )}
        {right}
      </div>
    </header>
  );
}
