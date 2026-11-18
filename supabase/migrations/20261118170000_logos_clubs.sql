-- Base des logos des équipes, remplie automatiquement par la synchro FFR
-- à partir de Mon Club House. Une équipe est repérée par son identifiant
-- FFR stable (le même que classements.ffr_identifiant). Une entente entre
-- plusieurs clubs a un logo par club, comme les logos d'adversaire des matchs.
create table if not exists public.equipes_ffr (
  identifiant text primary key,
  nom text not null,
  -- Logos copiés dans notre stockage (bucket classements-logos, dossier ffr/).
  logos text[] not null default '{}',
  -- Adresses d'origine sur Mon Club House, pour ne recopier que ce qui change.
  logos_source text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.equipes_ffr enable row level security;

create policy "Lecture publique equipes_ffr"
  on public.equipes_ffr for select using (true);
create policy "Ecriture equipe equipes_ffr update"
  on public.equipes_ffr for update using (is_team_member()) with check (is_team_member());
create policy "Ecriture equipe equipes_ffr delete"
  on public.equipes_ffr for delete using (is_team_member());
