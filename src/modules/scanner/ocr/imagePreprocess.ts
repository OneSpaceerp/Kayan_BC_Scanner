export function preprocessImage(canvas: HTMLCanvasElement): Promise<Blob> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("No 2d context available"));

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Apply Grayscale and Contrast Stretch
  const contrast = 1.5;
  const intercept = 128 * (1 - contrast);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Grayscale based on human perception
    const gray = r * 0.3 + g * 0.59 + b * 0.11;

    // Apply contrast
    const newGray = gray * contrast + intercept;
    const finalVal = Math.min(255, Math.max(0, newGray));

    data[i] = finalVal;
    data[i + 1] = finalVal;
    data[i + 2] = finalVal;
  }

  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to convert canvas to blob"));
      },
      "image/jpeg",
      0.95
    );
  });
}
