-- Section « Minibus » de l'administration : à exécuter une fois dans
-- Supabase (SQL Editor) avant d'utiliser la page /admin/minibus.

create table if not exists public.minibus_vehicules (
  id text primary key check (id in ('ancien', 'recent')),
  nom text not null,
  cout_km numeric(6,3) not null default 0 check (cout_km >= 0),
  updated_at timestamptz not null default now()
);

-- Tarifs de départ (modifiables ensuite depuis /admin/minibus).
insert into public.minibus_vehicules (id, nom, cout_km) values
  ('ancien', 'Ancien minibus', 0.35),
  ('recent', 'Minibus récent', 0.30)
on conflict (id) do nothing;

create table if not exists public.minibus_trajets (
  id uuid primary key default gen_random_uuid(),
  date_trajet date not null,
  minibus text not null references public.minibus_vehicules(id),
  depart text not null,
  arrivee text not null,
  aller_retour boolean not null default false,
  km_aller numeric(8,1) not null check (km_aller >= 0),
  km_total numeric(8,1) not null check (km_total >= 0),
  -- Tarif au km appliqué au moment de l'enregistrement : changer le tarif
  -- plus tard ne modifie pas le coût des trajets déjà saisis.
  cout_km numeric(6,3) not null check (cout_km >= 0),
  cout_total numeric(10,2) not null check (cout_total >= 0),
  motif text,
  conducteur text,
  created_at timestamptz not null default now()
);

create index if not exists minibus_trajets_date_idx
  on public.minibus_trajets (date_trajet desc);

-- Données internes : visibles et modifiables uniquement par l'équipe.
alter table public.minibus_vehicules enable row level security;
alter table public.minibus_trajets enable row level security;

create policy minibus_vehicules_select_team on public.minibus_vehicules
  for select using (is_team_member());
create policy minibus_vehicules_update_team on public.minibus_vehicules
  for update using (is_team_member()) with check (is_team_member());

create policy minibus_trajets_select_team on public.minibus_trajets
  for select using (is_team_member());
create policy minibus_trajets_insert_team on public.minibus_trajets
  for insert with check (is_team_member());
create policy minibus_trajets_update_team on public.minibus_trajets
  for update using (is_team_member()) with check (is_team_member());
create policy minibus_trajets_delete_team on public.minibus_trajets
  for delete using (is_team_member());
