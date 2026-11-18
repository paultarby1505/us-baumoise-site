-- Synchronisation automatique avec Mon Club House (site officiel de la FFR).

-- Pour chaque catégorie du site : la page de la compétition sur Mon Club
-- House et le nom de notre équipe tel que la FFR l'écrit.
create table if not exists public.ffr_sources (
  categorie text primary key,
  url text not null,
  equipe_ffr text not null,
  actif boolean not null default true,
  derniere_synchro timestamptz,
  dernier_statut text,
  updated_at timestamptz not null default now()
);

alter table public.ffr_sources enable row level security;

create policy "Lecture equipe ffr_sources"
  on public.ffr_sources for select using (is_team_member());
create policy "Ecriture equipe ffr_sources insert"
  on public.ffr_sources for insert with check (is_team_member());
create policy "Ecriture equipe ffr_sources update"
  on public.ffr_sources for update using (is_team_member()) with check (is_team_member());
create policy "Ecriture equipe ffr_sources delete"
  on public.ffr_sources for delete using (is_team_member());

-- Identifiant du match sur le site de la FFR, et date de la dernière
-- version de sa feuille de match qu'on a lue.
alter table public.matchs add column if not exists ffr_match_id bigint unique;
alter table public.matchs add column if not exists ffr_maj text;

-- Identifiant stable de l'équipe à la FFR, pour retrouver la bonne ligne
-- du classement même si le nom affiché sur le site est différent.
alter table public.classements add column if not exists ffr_identifiant text;

-- Compétitions de la saison 2026-2027 (modifiables dans l'admin quand la
-- phase change : brassage, qualification, phases finales...).
insert into public.ffr_sources (categorie, url, equipe_ffr) values
  ('Seniors', 'https://monclubhouse.ffr.fr/clubs/u-s-baumoise/competitions/bourgogne-franche-comte-regionale-3-championnat-territorial/qualification-50077', 'Us Baumoise Ob'),
  ('U16', 'https://monclubhouse.ffr.fr/clubs/ol-besancon/competitions/bourgogne-franche-comte-regional-1-u16-championnat-territorial/qualification-50407', 'Ol Besancon'),
  ('U19', 'https://monclubhouse.ffr.fr/clubs/ol-besancon/competitions/bourgogne-franche-comte-regional-2-u19/qualification-50410', 'Ol Besancon')
on conflict (categorie) do nothing;
