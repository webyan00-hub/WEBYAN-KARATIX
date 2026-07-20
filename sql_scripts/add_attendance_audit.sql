-- SQL à exécuter dans Supabase pour ajouter la traçabilité aux présences
ALTER TABLE attendances 
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default now();

-- Note : Vous n'avez pas besoin de créer de nouvelles politiques RLS ici car les politiques existantes sur 'attendances' s'appliqueront aux nouvelles colonnes.
