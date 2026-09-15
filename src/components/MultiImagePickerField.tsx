"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image-compress";
import ImageCropperModal from "@/components/ImageCropperModal";

function extForMimeType(type: string): string {
  return type === "image/png" ? "png" : "jpg";
}

type Item = { key: string; file: File; previewUrl: string };

export default function MultiImagePickerField({
  name,
  label,
  helpText,
  aspect,
}: {
  name: string;
  label: string;
  helpText?: string;
  aspect?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "compressing" | "error">("idle");
  const [items, setItems] = useState<Item[]>([]);
  const [cropKey, setCropKey] = useState<string | null>(null);

  function syncInputFiles(next: Item[]) {
    const input = inputRef.current;
    if (!input) return;
    const dataTransfer = new DataTransfer();
    next.forEach((item) => dataTransfer.items.add(item.file));
    input.files = dataTransfer.files;
  }

  async function handleChange() {
    const input = inputRef.current;
    const files = input?.files;
    if (!input || !files || files.length === 0) {
      setItems([]);
      return;
    }

    setStatus("compressing");
    try {
      const compressed = await Promise.all(Array.from(files).map(compressImage));
      const next = compressed.map((file) => ({
        key: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      syncInputFiles(next);
      setItems(next);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function removeItem(key: string) {
    const next = items.filter((item) => item.key !== key);
    syncInputFiles(next);
    setItems(next);
  }

  async function applyCrop(key: string, blob: Blob) {
    const target = items.find((item) => item.key === key);
    setCropKey(null);
    if (!target) return;

    const base = target.file.name.replace(/\.[^.]+$/, "") || "photo";
    const type = blob.type || target.file.type || "image/jpeg";
    const cropped = new File([blob], `${base}.${extForMimeType(type)}`, { type });
    const compressed = await compressImage(cropped);
    const next = items.map((item) =>
      item.key === key
        ? { ...item, file: compressed, previewUrl: URL.createObjectURL(compressed) }
        : item
    );
    syncInputFiles(next);
    setItems(next);
  }

  const cropTarget = items.find((item) => item.key === cropKey);

  return (
    <>
      <label className="block text-sm font-medium">
        {label}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          multiple
          onChange={handleChange}
          className="mt-1 w-full rounded border border-black/20 px-3 py-2"
        />
        {status === "compressing" && (
          <span className="mt-1 block text-xs text-foreground/50">
            Optimisation des photos…
          </span>
        )}
        {status === "error" && (
          <span className="mt-1 block text-xs text-red-600">
            Les photos n&apos;ont pas pu être optimisées, les originaux seront envoyés.
          </span>
        )}
        {status === "idle" && items.length === 0 && helpText && (
          <span className="mt-1 block text-xs text-foreground/50">{helpText}</span>
        )}
      </label>
      {items.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-3">
          {items.map((item) => (
            <div key={item.key} className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt=""
                className="h-20 w-20 rounded border border-black/10 object-cover"
              />
              <div className="mt-1 flex justify-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCropKey(item.key)}
                  className="font-semibold text-club-gold hover:underline"
                >
                  Recadrer
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="text-red-600 hover:underline"
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {cropTarget && (
        <ImageCropperModal
          src={cropTarget.previewUrl}
          aspect={aspect}
          mimeType={cropTarget.file.type}
          onCancel={() => setCropKey(null)}
          onConfirm={(blob) => applyCrop(cropTarget.key, blob)}
        />
      )}
    </>
  );
}
