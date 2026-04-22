import { useState, useEffect, useRef, useCallback } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Use a ref to hold the stream so stopCamera has a stable identity
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attachStream = useCallback((mediaStream: MediaStream) => {
    streamRef.current = mediaStream;
    setIsReady(true);
    // Attach to video element immediately if available
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(console.error);
    }
  }, []);

  const startCamera = useCallback(async () => {
    // If already running, skip
    if (streamRef.current) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      attachStream(mediaStream);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to access camera");
    }
  }, [attachStream]);

  const stopCamera = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsReady(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureImage = useCallback((): HTMLCanvasElement | null => {
    if (!videoRef.current || !streamRef.current) return null;
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
  }, []);

  // When isReady changes to true, ensure video element has the stream
  useEffect(() => {
    if (isReady && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [isReady]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      const s = streamRef.current;
      if (s) {
        s.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return { videoRef, startCamera, stopCamera, captureImage, error, isReady };
}
