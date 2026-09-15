const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  // Les PNG (et WebP) peuvent avoir un fond transparent (ex: logo d'un club
  // adverse) : les convertir en JPEG remplirait la transparence en noir.
  const preserveTransparency = file.type === "image/png" || file.type === "image/webp";

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const outputType = preserveTransparency ? "image/png" : "image/jpeg";
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, outputType, preserveTransparency ? undefined : JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const ext = preserveTransparency ? "png" : "jpg";
    const newName = file.name.replace(/\.[^.]+$/, "") + "." + ext;
    return new File([blob], newName, { type: outputType });
  } catch {
    // Format non décodable par le navigateur (ex: certains HEIC) : on garde le fichier original.
    return file;
  }
}
