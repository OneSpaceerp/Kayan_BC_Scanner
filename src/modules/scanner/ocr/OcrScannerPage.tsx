import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, X } from "lucide-react";
import { useCamera } from "@/shared/hooks/useCamera";
import { preprocessImage } from "./imagePreprocess";

export default function OcrScannerPage() {
  const navigate = useNavigate();
  const { videoRef, startCamera, stopCamera, captureImage, error } = useCamera();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    const canvas = captureImage();
    if (!canvas) return;
    
    stopCamera();
    
    try {
      const blob = await preprocessImage(canvas);
      navigate("/scan/ocr/preview", { state: { imageBlob: blob } });
    } catch (err) {
      console.error(err);
      navigate("/");
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={() => navigate("/")} 
          className="p-2 bg-black/50 rounded-full text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-white text-sm">
          {error}
        </div>
      ) : (
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative w-[80%] aspect-[1.6/1] border-2 border-brand/50 rounded-lg box-border shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-brand rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-brand rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-brand rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-brand rounded-br-lg" />
          </div>
        </div>
      )}

      {/* Capture Button */}
      <div className="absolute bottom-0 inset-x-0 p-8 flex justify-center items-center bg-black/80">
        <button
          onClick={handleCapture}
          className="w-16 h-16 rounded-full bg-white flex items-center justify-center p-1 active:scale-95 transition-transform"
        >
          <div className="w-full h-full rounded-full border-2 border-black flex items-center justify-center">
            <Camera className="w-6 h-6 text-black" />
          </div>
        </button>
      </div>
    </div>
  );
}
