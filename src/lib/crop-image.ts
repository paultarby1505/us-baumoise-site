import type { PixelCrop } from "react-image-crop";

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
