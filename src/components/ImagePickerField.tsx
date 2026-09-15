"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image-compress";
import ImageCropperModal from "@/components/ImageCropperModal";

export default function ImagePickerField({
  name,
  label,
  required,
  helpText,
  aspect,
}: {
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
  aspect?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "compressing" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const pendingFileName = useRef<string>("photo.jpg");

  function handlePick() {
    const input = inputRef.current;
    const file = input?.files?.[0];
    if (!input || !file) return;
    pendingFileName.current = file.name;
    setCropSrc(URL.createObjectURL(file));
  }

  async function applyCroppedFile(blob: Blob) {
    const input = inputRef.current;
    setCropSrc(null);
    if (!input) return;

    setStatus("compressing");
    try {
      const base = pendingFileName.current.replace(/\.[^.]+$/, "") || "photo";
      const cropped = new File([blob], `${base}.jpg`, { type: blob.type || "image/jpeg" });
      const compressed = await compressImage(cropped);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(compressed);
      input.files = dataTransfer.files;
      setPreviewUrl(URL.createObjectURL(compressed));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function cancelCrop() {
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function reopenCrop() {
    const file = inputRef.current?.files?.[0];
    if (file) setCropSrc(URL.createObjectURL(file));
  }

  return (
    <>
      <label className="block text-sm font-medium">
        {label}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          required={required}
          onChange={handlePick}
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
        {status === "idle" && previewUrl && (
          <span className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" className="h-16 w-16 rounded object-cover" />
            <button
              type="button"
              onClick={reopenCrop}
              className="text-xs font-semibold text-club-gold hover:underline"
            >
              Recadrer à nouveau
            </button>
          </span>
        )}
        {status === "idle" && !previewUrl && helpText && (
          <span className="mt-1 block text-xs text-foreground/50">{helpText}</span>
        )}
      </label>
      {cropSrc && (
        <ImageCropperModal
          src={cropSrc}
          aspect={aspect}
          onCancel={cancelCrop}
          onConfirm={applyCroppedFile}
        />
      )}
    </>
  );
}
