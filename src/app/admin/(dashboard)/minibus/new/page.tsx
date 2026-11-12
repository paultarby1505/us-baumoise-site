import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createMinibusTrajet } from "@/app/admin/actions";
import MinibusTrajetForm from "@/components/MinibusTrajetForm";
import type { MinibusVehicule } from "@/lib/types";

export default async function NewMinibusTrajetPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("minibus_vehicules").select("*");
  const vehicules = (data ?? []) as MinibusVehicule[];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Nouveau trajet minibus</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <MinibusTrajetForm
        action={createMinibusTrajet}
        vehicules={vehicules}
        submitLabel="Enregistrer le trajet"
      />
    </div>
  );
}
