"use client";

import { useRef, useState } from "react";
import { compressImage } from "@/lib/image-compress";

export default function MultiImagePickerField({
  name,
  label,
  helpText,
}: {
  name: string;
  label: string;
  helpText?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "compressing" | "error">("idle");
  const [count, setCount] = useState(0);

  async function handleChange() {
    const input = inputRef.current;
    const files = input?.files;
    if (!input || !files || files.length === 0) {
      setCount(0);
      return;
    }

    setStatus("compressing");
    try {
      const compressed = await Promise.all(Array.from(files).map(compressImage));
      const dataTransfer = new DataTransfer();
      compressed.forEach((file) => dataTransfer.items.add(file));
      input.files = dataTransfer.files;
      setCount(compressed.length);
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
      {status === "idle" && count > 0 && (
        <span className="mt-1 block text-xs text-foreground/50">
          {count} photo{count > 1 ? "s" : ""} sélectionnée{count > 1 ? "s" : ""}.
        </span>
      )}
      {status === "idle" && count === 0 && helpText && (
        <span className="mt-1 block text-xs text-foreground/50">{helpText}</span>
      )}
    </label>
  );
}
