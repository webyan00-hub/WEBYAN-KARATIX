
------------------------------- Tables for the Karate club application

create table if not exists clubs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  owner_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

---------------------------- Table Members avec tous les champs requis
create table if not exists members (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid references clubs(id) on delete cascade not null,
  member_number text not null, -- Ex: 'KTX-2026-0001'
  
  -- ETAPE 1 : Identité
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  entry_date date default now(),
  gender text,
  grade text,
  photo_url text, -- Chemin vers le fichier dans le storage
  
  -- ETAPE 2 : Contact
  phone text,
  email text,
  address text,
  
  -- ETAPE 3 : Contact Urgence
  emergency_name text,
  emergency_phone text,
  emergency_relationship text,
  
  -- ETAPE 4 : Médical & Notes
  allergies text,
  injuries text,
  medical_notes text,
  coach_notes text,
  
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Index pour la performance
create index if not exists idx_members_club_id on members(club_id);
create index if not exists idx_members_last_name on members(last_name);
create unique index if not exists idx_members_club_number on members(club_id, member_number);

---------------------------- Tables pour les séances et présences
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid references clubs(id) on delete cascade not null,
  name text not null,
  day_of_week integer not null, -- 0 pour Dimanche, 1 pour Lundi, ..., 6 pour Samedi
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default now()
);

create table if not exists attendances (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid references clubs(id) on delete cascade not null,
  member_id uuid references members(id) on delete cascade not null,
  session_id uuid references sessions(id) on delete cascade not null,
  attendance_date date not null default current_date,
  status text not null check (status in ('present', 'absent')),
  created_at timestamp with time zone default now()
);

create index if not exists idx_attendances_date_member on attendances(attendance_date, member_id);
create index if not exists idx_attendances_session on attendances(session_id);

-- Sécurité RLS
alter table members enable row level security;
alter table sessions enable row level security;
alter table attendances enable row level security;

create policy "Accès complet aux membres pour le propriétaire du club" on members
  for all using (
    club_id in (
      select id from clubs where owner_id = auth.uid()
    )
  )
  with check (
    club_id in (
      select id from clubs where owner_id = auth.uid()
    )
  );

-- Les politiques suivantes pourraient échouer si déjà créées, c'est normal
create policy "Accès aux séances" on sessions for all using (
  club_id in (select id from clubs where owner_id = auth.uid())
);

create policy "Accès aux présences" on attendances for all using (
  club_id in (select id from clubs where owner_id = auth.uid())
);
