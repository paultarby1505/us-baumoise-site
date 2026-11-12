import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { updateMinibusTrajet, deleteMinibusTrajet } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import MinibusTrajetForm from "@/components/MinibusTrajetForm";
import type { MinibusTrajet, MinibusVehicule } from "@/lib/types";

export default async function EditMinibusTrajetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const [{ data: trajet }, { data: vehiculesData }] = await Promise.all([
    supabase.from("minibus_trajets").select("*").eq("id", id).maybeSingle(),
    supabase.from("minibus_vehicules").select("*"),
  ]);

  if (!trajet) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Modifier le trajet</h1>
      {error && (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <MinibusTrajetForm
        action={updateMinibusTrajet.bind(null, id)}
        vehicules={(vehiculesData ?? []) as MinibusVehicule[]}
        trajet={trajet as MinibusTrajet}
        submitLabel="Enregistrer"
      />
      <form action={deleteMinibusTrajet.bind(null, id)} className="mt-8">
        <ConfirmSubmitButton
          confirmMessage="Supprimer ce trajet ?"
          className="text-sm text-red-600 hover:underline"
        >
          Supprimer ce trajet
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
