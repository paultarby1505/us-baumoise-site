"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image-compress";
import { getCenterCroppedBlob } from "@/lib/crop-image";
import ImageCropperModal from "@/components/ImageCropperModal";

function extForMimeType(type: string): string {
  return type === "image/png" ? "png" : "jpg";
}

export default function ImagePickerField({
  name,
  label,
  required,
  helpText,
  aspect,
  autoCrop,
}: {
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
  aspect?: number;
  autoCrop?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "compressing" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropType, setCropType] = useState<string | undefined>(undefined);
  const pendingFile = useRef<File | null>(null);

  async function handlePick() {
    const input = inputRef.current;
    const file = input?.files?.[0];
    if (!input || !file) return;
    pendingFile.current = file;

    if (autoCrop && aspect) {
      try {
        // Photo de joueur : toujours en JPEG, un PNG garderait plusieurs Mo.
        const blob = await getCenterCroppedBlob(file, aspect, "image/jpeg");
        await applyCroppedFile(blob);
      } catch {
        setStatus("error");
      }
      return;
    }

    setCropType(file.type);
    setCropSrc(URL.createObjectURL(file));
  }

  async function applyCroppedFile(blob: Blob) {
    const input = inputRef.current;
    const original = pendingFile.current;
    setCropSrc(null);
    if (!input) return;

    setStatus("compressing");
    try {
      const base = (original?.name ?? "photo").replace(/\.[^.]+$/, "") || "photo";
      const type = blob.type || original?.type || "image/jpeg";
      const cropped = new File([blob], `${base}.${extForMimeType(type)}`, { type });
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
    if (file) {
      pendingFile.current = file;
      setCropType(file.type);
      setCropSrc(URL.createObjectURL(file));
    }
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
            {!autoCrop && (
              <button
                type="button"
                onClick={reopenCrop}
                className="text-xs font-semibold text-club-gold hover:underline"
              >
                Recadrer à nouveau
              </button>
            )}
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
          mimeType={cropType}
          onCancel={cancelCrop}
          onConfirm={applyCroppedFile}
        />
      )}
    </>
  );
}
