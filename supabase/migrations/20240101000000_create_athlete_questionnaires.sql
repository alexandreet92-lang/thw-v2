-- Table des candidatures reçues via le formulaire du site web
create table if not exists public.athlete_questionnaires (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  first_name       text not null,
  last_name        text not null,
  email            text not null,
  phone            text,
  age              integer,
  sport            text,
  current_level    text,
  goals            text,
  training_frequency text,
  availability     text,
  additional_info  text,
  status           text not null default 'pending'
    check (status in ('pending', 'reviewed', 'accepted', 'rejected'))
);

-- Index pour filtrer rapidement les candidatures non traitées
create index if not exists idx_athlete_questionnaires_status
  on public.athlete_questionnaires (status);

-- RLS : lecture réservée aux utilisateurs authentifiés de l'app
alter table public.athlete_questionnaires enable row level security;

create policy "Authenticated users can read questionnaires"
  on public.athlete_questionnaires for select
  to authenticated
  using (true);

-- L'insertion se fait uniquement via le service_role (API backend), pas en direct depuis le client
-- Activer les changements temps réel sur cette table
alter publication supabase_realtime add table public.athlete_questionnaires;
