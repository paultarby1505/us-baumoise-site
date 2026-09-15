import { createServerSupabaseClient } from "@/lib/supabase-server";
import { markContactLu, deleteContact } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import type { Contact } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminContactsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  const contacts = (data ?? []) as Contact[];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Messages reçus</h1>

      <div className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {contacts.map((c) => (
          <div key={c.id} className={`p-4 ${c.lu ? "" : "bg-club-gold/5"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {c.objet}
                  {!c.lu && (
                    <span className="ml-2 rounded-full bg-club-gold px-2 py-0.5 text-[10px] font-bold uppercase text-black">
                      Nouveau
                    </span>
                  )}
                </p>
                <p className="text-sm text-foreground/70">
                  {c.prenom} {c.nom}
                </p>
                <p className="text-xs text-foreground/50">
                  {[c.email, c.telephone].filter(Boolean).join(" · ")}
                </p>
                <p className="text-xs text-foreground/40">{formatDate(c.created_at)}</p>
              </div>
              <div className="flex shrink-0 gap-3 text-sm">
                <form action={markContactLu.bind(null, c.id, !c.lu)}>
                  <button type="submit" className="text-club-gold hover:underline">
                    {c.lu ? "Marquer non lu" : "Marquer comme traité"}
                  </button>
                </form>
                <form action={deleteContact.bind(null, c.id)}>
                  <ConfirmSubmitButton
                    confirmMessage="Supprimer ce message ?"
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/80">{c.message}</p>
          </div>
        ))}
        {contacts.length === 0 && (
          <p className="p-4 text-sm text-foreground/60">Aucun message pour le moment.</p>
        )}
      </div>
    </div>
  );
}
