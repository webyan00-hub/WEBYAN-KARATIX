-- SQL à exécuter dans Supabase pour gérer la validation des séances
CREATE TABLE IF NOT EXISTS session_instances (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  instance_date date NOT NULL,
  is_validated boolean DEFAULT false,
  club_id uuid REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(session_id, instance_date)
);

ALTER TABLE session_instances ENABLE ROW LEVEL SECURITY;

-- Création de la politique RLS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Accès aux instances de séances') THEN
        CREATE POLICY "Accès aux instances de séances" ON session_instances FOR ALL USING (
            club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid())
        );
    END IF;
END $$;
