-- Match reporté (terrain impraticable, report décidé par la FFR...) :
-- affiché « Reporté » à la place du score.
alter table public.matchs add column if not exists reporte boolean not null default false;
