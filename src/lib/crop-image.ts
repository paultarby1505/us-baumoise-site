import type { PixelCrop } from "react-image-crop";

export async function getCenterCroppedBlob(
  file: File,
  aspect: number,
  mimeType?: string,
  quality = 0.92
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const currentAspect = width / height;

  let sx = 0;
  let sy = 0;
  let sw = width;
  let sh = height;
  if (currentAspect > aspect) {
    sw = Math.round(height * aspect);
    sx = Math.round((width - sw) / 2);
  } else {
    sh = Math.round(width / aspect);
    sy = Math.round((height - sh) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossible de préparer le recadrage.");
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Échec du recadrage."))),
      mimeType || file.type || "image/jpeg",
      quality
    );
  });
}

export async function getCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
  mimeType = "image/jpeg",
  quality = 0.92
): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.width * scaleX));
  canvas.height = Math.max(1, Math.round(crop.height * scaleY));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossible de préparer le recadrage.");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Échec du recadrage."))),
      mimeType,
      quality
    );
  });
}
