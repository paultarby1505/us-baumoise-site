"use client";

import { useRef, useState } from "react";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

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

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // Format non décodable par le navigateur (ex: certains HEIC) : on garde le fichier original.
    return file;
  }
}

export default function ImagePickerField({
  name,
  label,
  required,
  helpText,
}: {
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "compressing" | "error">("idle");

  async function handleChange() {
    const input = inputRef.current;
    const file = input?.files?.[0];
    if (!input || !file) return;

    setStatus("compressing");
    try {
      const compressed = await compressImage(file);
      if (compressed !== file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(compressed);
        input.files = dataTransfer.files;
      }
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        required={required}
        onChange={handleChange}
        className="mt-1 w-full rounded border border-black/20 px-3 py-2"
      />
      {status === "compressing" && (
        <span className="mt-1 block text-xs text-foreground/50">
          Optimisation de la photo…
        </span>
      )}
      {status === "error" && (
        <span className="mt-1 block text-xs text-red-600">
          La photo n&apos;a pas pu être optimisée, l&apos;original sera envoyé.
        </span>
      )}
      {status === "idle" && helpText && (
        <span className="mt-1 block text-xs text-foreground/50">{helpText}</span>
      )}
    </label>
  );
}
