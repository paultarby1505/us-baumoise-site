"use client";

import { useState } from "react";
import MultiImagePickerField from "@/components/MultiImagePickerField";

export default function LogosField({
  keepFieldName,
  newFieldName,
  label,
  helpText,
  initialUrls,
}: {
  keepFieldName: string;
  newFieldName: string;
  label: string;
  helpText?: string;
  initialUrls: string[];
}) {
  const [kept, setKept] = useState(initialUrls);

  return (
    <div>
      {kept.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium">{label}</p>
          <div className="mt-1 flex flex-wrap gap-3">
            {kept.map((url) => (
              <div key={url} className="text-center">
                <div className="h-16 w-16 overflow-hidden rounded border border-black/10 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => setKept(kept.filter((u) => u !== url))}
                  className="mt-1 text-xs text-red-600 hover:underline"
                >
                  Retirer
                </button>
                <input type="hidden" name={keepFieldName} value={url} />
              </div>
            ))}
          </div>
        </div>
      )}
      <MultiImagePickerField
        name={newFieldName}
        label={kept.length > 0 ? `Ajouter d'autres logos` : label}
        helpText={helpText}
      />
    </div>
  );
}
