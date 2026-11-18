-- Feuille de match : détails d'un match (essais, buteurs, cartons,
-- remplacements) et mise à jour automatique du classement.

create table if not exists public.match_evenements (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matchs(id) on delete cascade,
  position integer not null default 0,
  type text not null check (type in (
    'essai', 'essai_penalite', 'transformation', 'penalite', 'drop',
    'carton_blanc', 'carton_jaune', 'carton_rouge', 'remplacement'
  )),
  minute smallint check (minute is null or (minute >= 0 and minute <= 120)),
  -- Joueur concerné (pour un remplacement : le joueur qui ENTRE).
  -- joueur_id est vide quand le joueur n'est pas dans l'effectif du site :
  -- son nom est alors affiché suivi de « (OB) ».
  joueur_id uuid references public.joueurs(id) on delete set null,
  joueur_nom text,
  -- Pour un remplacement : le joueur qui SORT.
  joueur_sortant_id uuid references public.joueurs(id) on delete set null,
  joueur_sortant_nom text,
  created_at timestamptz not null default now()
);

create index if not exists match_evenements_match_id_idx
  on public.match_evenements (match_id, position);

alter table public.match_evenements enable row level security;

create policy "Lecture publique evenements"
  on public.match_evenements for select using (true);
create policy "Ecriture equipe evenements insert"
  on public.match_evenements for insert with check (is_team_member());
create policy "Ecriture equipe evenements update"
  on public.match_evenements for update using (is_team_member()) with check (is_team_member());
create policy "Ecriture equipe evenements delete"
  on public.match_evenements for delete using (is_team_member());

-- Ce que le résultat du match a ajouté au classement (lignes touchées et
-- valeurs ajoutées), pour pouvoir corriger un score sans compter le match
-- deux fois. Vide = le match n'a jamais été compté automatiquement.
alter table public.matchs
  add column if not exists classement_applique jsonb;
