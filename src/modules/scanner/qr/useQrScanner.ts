import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

export type QrScannerState = "idle" | "starting" | "scanning" | "error";

interface UseQrScannerOptions {
  elementId: string;
  onScan: (raw: string) => void;
  onError?: (err: string) => void;
}

interface UseQrScannerReturn {
  state: QrScannerState;
  torchOn: boolean;
  torchSupported: boolean;
  toggleTorch: () => Promise<void>;
  stop: () => Promise<void>;
}

export function useQrScanner({
  elementId,
  onScan,
  onError,
}: UseQrScannerOptions): UseQrScannerReturn {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);
  const startedRef = useRef(false);
  // Use refs for callbacks to avoid stale closures
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  // Debounce: prevent firing multiple times for the same code
  const lastScannedRef = useRef<string | null>(null);
  const lastScannedTimeRef = useRef(0);

  const [state, setState] = useState<QrScannerState>("idle");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  // Keep refs in sync with latest callbacks
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const stop = useCallback(async () => {
    if (!scannerRef.current) return;
    try {
      const s = scannerRef.current;
      if (s.isScanning) await s.stop();
      s.clear();
    } catch {
      // ignore stop errors
    }
    scannerRef.current = null;
    startedRef.current = false;
    if (mountedRef.current) setState("idle");
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Guard against React 18 StrictMode double-invocation
    if (startedRef.current) return;
    startedRef.current = true;

    const scanner = new Html5Qrcode(elementId, {
      verbose: false,
    });
    scannerRef.current = scanner;

    setState("starting");

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          if (!mountedRef.current) return;
          
          // Debounce: ignore same code within 3 seconds
          const now = Date.now();
          if (
            decodedText === lastScannedRef.current &&
            now - lastScannedTimeRef.current < 3000
          ) {
            return;
          }
          lastScannedRef.current = decodedText;
          lastScannedTimeRef.current = now;

          onScanRef.current(decodedText);
        },
        undefined,
      )
      .then(() => {
        if (!mountedRef.current) { stop(); return; }
        setState("scanning");

        // Detect torch capability via the underlying MediaStreamTrack
        try {
          const track = (scanner as unknown as {
            videoElement?: HTMLVideoElement;
          }).videoElement?.srcObject;
          if (track instanceof MediaStream) {
            const [videoTrack] = track.getVideoTracks();
            const caps = videoTrack?.getCapabilities?.() as { torch?: boolean } | undefined;
            if (caps?.torch) setTorchSupported(true);
          }
        } catch {
          // torch detection is best-effort
        }
      })
      .catch((err: unknown) => {
        if (!mountedRef.current) return;
        setState("error");
        onErrorRef.current?.(err instanceof Error ? err.message : String(err));
      });

    return () => {
      mountedRef.current = false;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId]);

  const toggleTorch = useCallback(async () => {
    if (!scannerRef.current || !torchSupported) return;
    try {
      const next = !torchOn;
      // html5-qrcode exposes applyVideoConstraints on the internal track
      const s = scannerRef.current as unknown as {
        applyVideoConstraints?: (c: object) => Promise<void>;
      };
      await s.applyVideoConstraints?.({ advanced: [{ torch: next }] });
      setTorchOn(next);
    } catch {
      // torch toggle failed silently
    }
  }, [torchOn, torchSupported]);

  return { state, torchOn, torchSupported, toggleTorch, stop };
}
