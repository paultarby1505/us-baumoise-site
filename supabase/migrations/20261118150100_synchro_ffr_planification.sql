-- Lancement automatique de la synchronisation FFR :
--  - toutes les 30 minutes le samedi et le dimanche, de 12 h à 22 h (heure de Paris env.)
--  - une fois par jour, à 7 h, pour les matchs joués en semaine et les corrections.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'ffr-sync-week-end',
  '*/30 10-21 * * 6,0',
  $$ select net.http_post(
       url := 'https://geefzxozzuvrqvuuvxkr.supabase.co/functions/v1/ffr-sync',
       headers := '{"Content-Type": "application/json"}'::jsonb,
       body := '{}'::jsonb,
       timeout_milliseconds := 120000
     ) $$
);

select cron.schedule(
  'ffr-sync-quotidien',
  '0 6 * * *',
  $$ select net.http_post(
       url := 'https://geefzxozzuvrqvuuvxkr.supabase.co/functions/v1/ffr-sync',
       headers := '{"Content-Type": "application/json"}'::jsonb,
       body := '{}'::jsonb,
       timeout_milliseconds := 120000
     ) $$
);
