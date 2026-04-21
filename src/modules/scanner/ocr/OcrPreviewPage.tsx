import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { runOcr } from "./ocrWorker";
import { extractFields } from "./fieldExtractor";

export default function OcrPreviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const imageBlob = location.state?.imageBlob as Blob | undefined;

  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (!imageBlob) {
      navigate("/scan/ocr", { replace: true });
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        const text = await runOcr(imageBlob, (p) => {
          if (isMounted) setProgress(p);
        });

        if (isMounted) {
          const fields = extractFields(text);
          // Navigate to LeadReviewPage with the pre-filled fields
          navigate("/lead/review", {
            state: {
              captureMethod: "OCR",
              lead_name: fields.name || "",
              company_name: fields.company || "",
              email_id: fields.email || "",
              mobile_no: fields.mobile_no || fields.phone || "",
              phone: fields.phone || "",
              website: fields.website || "",
              job_title: fields.job_title || "",
              notes: "Parsed from OCR:\n" + text, 
              _imageBlob: imageBlob,
            },
            replace: true,
          });
        }
      } catch (err) {
        console.error("OCR Error:", err);
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [imageBlob, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-6 items-center justify-center">
      {isProcessing ? (
        <div className="w-full max-w-sm space-y-6 text-center">
          <p className="text-lg font-medium">Extracting text...</p>
          <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-[#A0A0A0]">{progress}%</p>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <p className="text-brand">Failed to parse image.</p>
          <button
            onClick={() => navigate("/scan/ocr", { replace: true })}
            className="flex items-center mx-auto px-6 py-2 bg-surface-alt rounded-full text-white font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
