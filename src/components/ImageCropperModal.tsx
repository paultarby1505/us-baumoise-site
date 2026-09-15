"use client";

import { useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { getCroppedBlob } from "@/lib/crop-image";

function initialCrop(width: number, height: number, aspect?: number): Crop {
  if (!aspect) {
    return { unit: "%", x: 5, y: 5, width: 90, height: 90 };
  }
  return centerCrop(makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height), width, height);
}

export default function ImageCropperModal({
  src,
  aspect,
  mimeType,
  onCancel,
  onConfirm,
}: {
  src: string;
  aspect?: number;
  mimeType?: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [busy, setBusy] = useState(false);

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(initialCrop(width, height, aspect));
  }

  async function handleConfirm() {
    const image = imgRef.current;
    if (!image || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      onCancel();
      return;
    }
    setBusy(true);
    try {
      const blob = await getCroppedBlob(image, completedCrop, mimeType || "image/jpeg");
      onConfirm(blob);
    } catch {
      onCancel();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-full w-full max-w-2xl overflow-auto rounded-lg bg-white p-4">
        <p className="text-sm font-semibold">Recadre la photo</p>
        <p className="mt-1 text-xs text-foreground/60">
          Fais glisser les bords du cadre pour choisir la partie visible de la photo.
        </p>
        <div className="mt-3 flex justify-center bg-neutral-100">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
            aspect={aspect}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={imgRef} src={src} alt="" onLoad={handleImageLoad} className="max-h-[60vh] w-auto" />
          </ReactCrop>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-black/20 px-4 py-2 text-sm font-semibold hover:bg-neutral-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="rounded bg-club-gold px-4 py-2 text-sm font-semibold text-black hover:bg-club-gold-light disabled:opacity-50"
          >
            {busy ? "Recadrage…" : "Valider le recadrage"}
          </button>
        </div>
      </div>
    </div>
  );
}
