import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { deleteMatch } from "@/app/admin/actions";
import AdminMatchList from "@/components/AdminMatchList";
import type { Match } from "@/lib/types";

export default async function AdminMatchsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("matchs")
    .select("*")
    .order("date_match", { ascending: false });
  const matchs = (data ?? []) as Match[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Matchs</h1>
        <Link
          href="/admin/matchs/new"
          className="rounded bg-club-gold px-4 py-2 text-sm font-semibold text-black hover:bg-club-gold-light"
        >
          + Nouveau match
        </Link>
      </div>

      <div className="mt-6">
        <AdminMatchList matchs={matchs} deleteMatch={deleteMatch} />
      </div>
    </div>
  );
}
