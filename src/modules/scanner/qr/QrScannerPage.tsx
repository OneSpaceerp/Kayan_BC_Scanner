import { useEffect, useId, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Flashlight, FlashlightOff } from "lucide-react";
import { AppHeader } from "@/shared/components/AppHeader";
import { useQrScanner } from "./useQrScanner";
import { parseQrCode } from "./qrParser";

const VIEWFINDER_ID = "qr-viewfinder";

export default function QrScannerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleScan = useCallback(
    (raw: string) => {
      const cardData = parseQrCode(raw);
      navigate("/lead/review", { state: cardData });
    },
    [navigate],
  );

  const { state, torchOn, torchSupported, toggleTorch, stop } = useQrScanner({
    elementId: VIEWFINDER_ID,
    onScan: handleScan,
  });

  // Release camera stream on back navigation
  const handleBack = useCallback(async () => {
    await stop();
    navigate(-1);
  }, [stop, navigate]);

  // Also stop on unmount safety (useQrScanner handles this, but belt+suspenders)
  useEffect(() => {
    return () => { stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isError = state === "error";

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <AppHeader
        title={t("scanner.qr.title")}
        showBack
        onBack={handleBack}
      />

      {/* Camera viewport */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
        {/* html5-qrcode mounts video into this div */}
        <div id={VIEWFINDER_ID} className="h-full w-full" />

        {/* Corner-bracket viewfinder overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="relative h-64 w-64">
            {/* Top-left */}
            <span className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-brand rounded-tl-sm" />
            {/* Top-right */}
            <span className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-brand rounded-tr-sm" />
            {/* Bottom-left */}
            <span className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-brand rounded-bl-sm" />
            {/* Bottom-right */}
            <span className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-brand rounded-br-sm" />
          </div>
        </div>

        {/* Error state */}
        {isError && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 text-center">
            <p className="text-sm text-red-400">{t("common.cameraError")}</p>
          </div>
        )}

        {/* Starting overlay */}
        {state === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-center border-t border-border bg-black px-6 py-5">
        {torchSupported && (
          <button
            onClick={toggleTorch}
            aria-label={t("scanner.qr.torch")}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-white transition-colors hover:border-brand hover:text-brand"
          >
            {torchOn ? (
              <FlashlightOff className="h-6 w-6" />
            ) : (
              <Flashlight className="h-6 w-6" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
