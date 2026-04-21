import Tesseract from "tesseract.js";

export async function runOcr(
  imageSource: Blob,
  onProgress: (progress: number) => void
): Promise<string> {
  // Using Tesseract.js v5 Worker
  const worker = await Tesseract.createWorker("eng+ara", 1, {
    // If you encounter loading issues locally, these paths can be configured to point 
    // to your public directory or CDN. By default we rely on the CDN with our 
    // downloaded worker languages configured in Vite PWA manifest to serve locally.
    langPath: "/traineddata", 
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  try {
    const objectUrl = URL.createObjectURL(imageSource);
    const {
      data: { text },
    } = await worker.recognize(objectUrl);
    
    URL.revokeObjectURL(objectUrl);
    return text;
  } finally {
    await worker.terminate();
  }
}
