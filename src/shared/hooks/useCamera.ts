import { useState, useEffect, useRef, useCallback } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      setStream(mediaStream);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to access camera");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = useCallback((): HTMLCanvasElement | null => {
    if (!videoRef.current || !stream) return null;
    const video = videoRef.current;
    
    // We draw slightly larger resolution for better OCR
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas;
    }
    return null;
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return { videoRef, startCamera, stopCamera, captureImage, error, isReady: !!stream };
}
