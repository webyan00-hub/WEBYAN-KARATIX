


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."add_payments_atomic_v2"("p_club_id" "uuid", "p_member_id" "uuid", "p_subscription_id" "uuid", "p_payments" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  p_record jsonb;
BEGIN
  FOR p_record IN
    SELECT *
    FROM jsonb_array_elements(p_payments)
  LOOP
    INSERT INTO public.payments (
      club_id,
      member_id,
      subscription_id,
      amount,
      payment_method,
      billing_period,
      created_by
    )
    VALUES (
      p_club_id,
      p_member_id,
      p_subscription_id,
      (p_record->>'amount')::numeric,
      p_record->>'payment_method',
      p_record->>'billing_period',
      auth.uid()
    );
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."add_payments_atomic_v2"("p_club_id" "uuid", "p_member_id" "uuid", "p_subscription_id" "uuid", "p_payments" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."apply_automatic_tariff_updates"() RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
    rec RECORD;
    current_member_count integer;
    target_tariff numeric;
    last_payment_amount numeric;
BEGIN
    FOR rec IN SELECT id, name FROM public.clubs LOOP
        -- Compter les membres actifs
        SELECT count(*) INTO current_member_count
        FROM public.members
        WHERE club_id = rec.id
          AND active = true;

        -- Déterminer le tarif cible
        IF current_member_count <= 30 THEN
            target_tariff := 10000;
        ELSIF current_member_count <= 70 THEN
            target_tariff := 20000;
        ELSE
            target_tariff := 35000;
        END IF;

        -- Vérifier le dernier tarif payé
        SELECT amount INTO last_payment_amount
        FROM public.payment_references
        WHERE club_id = rec.id
          AND status = 'paid'
        ORDER BY created_at DESC
        LIMIT 1;

        -- Si changement nécessaire : on crée directement la nouvelle référence pour le mois suivant
        -- (Au lieu d'attendre une approbation)
        IF last_payment_amount IS NOT NULL
           AND last_payment_amount <> target_tariff THEN

            INSERT INTO public.payment_references (
                club_id,
                amount,
                status,
                reference
            )
            VALUES (
                rec.id,
                target_tariff,
                'pending',
                'SUB-' || rec.id || '-' || to_char(now(), 'YYYYMM')
            );

            -- On logue l'automatisation
            INSERT INTO public.payment_audit_logs (
                payment_reference_id,
                old_status,
                new_status,
                reason
            )
            VALUES (
                currval(pg_get_serial_sequence('public.payment_references','id')),
                NULL,
                'pending',
                'Ajustement auto : Effectif ' || current_member_count || ' membres'
            );
        END IF;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."apply_automatic_tariff_updates"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_tier_price"("member_count" integer) RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF member_count <= 30 THEN
    RETURN 10000;
  ELSIF member_count <= 70 THEN
    RETURN 20000;
  ELSIF member_count <= 100 THEN
    RETURN 35000;
  ELSE
    RETURN 50000;
  END IF;
END;
$$;


ALTER FUNCTION "public"."calculate_tier_price"("member_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_tariff_updates"() RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
    rec RECORD;
    current_member_count integer;
    target_tariff numeric;
    last_payment_amount numeric;
BEGIN
    FOR rec IN SELECT id, name FROM public.clubs LOOP
        -- Compter les membres actifs
        SELECT count(*) INTO current_member_count
        FROM public.members
        WHERE club_id = rec.id AND active = true;

        -- Déterminer le tarif cible
        IF current_member_count <= 30 THEN
            target_tariff := 10000;
        ELSIF current_member_count <= 70 THEN
            target_tariff := 20000;
        ELSE
            target_tariff := 35000;
        END IF;

        -- Récupérer le montant du dernier paiement effectué
        SELECT amount INTO last_payment_amount
        FROM public.payment_references
        WHERE club_id = rec.id
          AND status = 'paid'
        ORDER BY created_at DESC
        LIMIT 1;

        -- Si un changement est nécessaire
        IF last_payment_amount IS NOT NULL
           AND last_payment_amount <> target_tariff THEN

            -- Vérifier s'il n'y a pas déjà une demande en attente
            IF NOT EXISTS (
                SELECT 1
                FROM public.pending_tariff_updates
                WHERE club_id = rec.id
                  AND status = 'pending'
            ) THEN
                INSERT INTO public.pending_tariff_updates (
                    club_id,
                    old_tariff,
                    new_tariff,
                    member_count
                )
                VALUES (
                    rec.id,
                    last_payment_amount,
                    target_tariff,
                    current_member_count
                );
            END IF;
        END IF;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."check_tariff_updates"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_member_number"("p_club_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
     declare
         next_number int;
         formatted_number text;
         current_year int := extract(year from now());
    begin
        -- On cherche le plus grand nombre actuel pour éviter les conflits de suppression
        select coalesce(max(substring(member_number from 10)::int), 0) + 1 into next_number
        from members
        where club_id = p_club_id
        and member_number like 'KTX-' || current_year || '-%';
   
        formatted_number := 'KTX-' || current_year || '-' || lpad(next_number::text, 4, '0');
        
        return formatted_number;
    end;
    $$;


ALTER FUNCTION "public"."generate_member_number"("p_club_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_subscription_with_payments"("p_member_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'subscription', s,
    'payments', COALESCE(
      jsonb_agg(p.*) FILTER (WHERE p.id IS NOT NULL),
      '[]'::jsonb
    )
  )
  INTO v_result
  FROM public.subscriptions s
  LEFT JOIN public.payments p
    ON s.id = p.subscription_id
  WHERE s.member_id = p_member_id
  GROUP BY s.id
  ORDER BY s.created_at DESC
  LIMIT 1;

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."get_subscription_with_payments"("p_member_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_club_active"("club_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
    DECLARE
      club_status text;
    BEGIN
      SELECT status INTO club_status FROM clubs WHERE id = club_id;
      RETURN club_status = 'active';
    END;
    $$;


ALTER FUNCTION "public"."is_club_active"("club_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_superadmin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.system_admins
    WHERE user_id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."is_superadmin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_payment_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.payment_audit_logs (
      payment_reference_id,
      changed_by,
      old_status,
      new_status,
      reason
    )
    VALUES (
      NEW.id,
      auth.uid(),
      OLD.status,
      NEW.status,
      'Changement de statut automatique'
    );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_payment_status_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_member_active_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
    BEGIN
      -- Si le member_status est 'active', alors active = true, sinon false
      NEW.active := (NEW.member_status = 'active');
      RETURN NEW;
    END;
    $$;


ALTER FUNCTION "public"."sync_member_active_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_club_tier_price_func"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  target_club_id uuid;
BEGIN
  -- Détermine quel club mettre à jour
  IF TG_OP = 'DELETE' THEN
    target_club_id := OLD.club_id;
  ELSE
    target_club_id := NEW.club_id;
  END IF;

  -- Met à jour le club principal
  IF target_club_id IS NOT NULL THEN
    UPDATE clubs
    SET current_tier_price = calculate_tier_price(
      (
        SELECT COUNT(*)::int
        FROM members
        WHERE club_id = target_club_id
      )
    )
    WHERE id = target_club_id;
  END IF;

  -- Si c'est un UPDATE et que le club a changé,
  -- on met aussi à jour l'ancien club
  IF TG_OP = 'UPDATE'
     AND OLD.club_id IS NOT NULL
     AND OLD.club_id <> NEW.club_id THEN
    UPDATE clubs
    SET current_tier_price = calculate_tier_price(
      (
        SELECT COUNT(*)::int
        FROM members
        WHERE club_id = OLD.club_id
      )
    )
    WHERE id = OLD.club_id;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_club_tier_price_func"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_member_grade"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
    BEGIN
        IF NEW.status = 'passed' AND NEW.grade_after IS NOT NULL THEN
            UPDATE public.members
            SET grade = NEW.grade_after
            WHERE id = NEW.member_id;
       END IF;
        RETURN NEW;
    END;
    $$;


ALTER FUNCTION "public"."update_member_grade"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "admin_id" "uuid",
    "action" "text" NOT NULL,
    "target_table" "text",
    "target_id" "uuid",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attendances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "club_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "session_id" "uuid" NOT NULL,
    "attendance_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "attendances_status_check" CHECK (("status" = ANY (ARRAY['present'::"text", 'absent'::"text"])))
);


ALTER TABLE "public"."attendances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."club_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "club_id" "uuid" NOT NULL,
    "monthly_tuition_price" numeric DEFAULT 0,
    "currency" "text" DEFAULT 'EUR'::"text",
    "grace_period_days" integer DEFAULT 5,
    "club_name" "text",
    "club_logo_url" "text",
    "payment_methods" "jsonb" DEFAULT '["Espèces", "Chèque", "Virement"]'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "club_settings_currency_check" CHECK (("currency" = ANY (ARRAY['EUR'::"text", 'MGA'::"text"])))
);


ALTER TABLE "public"."club_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clubs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "style" "text",
    "address" "text",
    "phone" "text",
    "contact_email" "text",
    "member_count" "text",
    "founded_date" "date",
    "enable_booking" boolean DEFAULT false,
    "owner_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text",
    "subscription_plan" "text" DEFAULT 'starter'::"text",
    "trial_ends_at" timestamp with time zone DEFAULT ("now"() + '14 days'::interval),
    "subscription_ends_at" timestamp with time zone,
    "current_tier_price" integer DEFAULT 0
);


ALTER TABLE "public"."clubs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exam_participants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid",
    "member_id" "uuid",
    "grade_before" "text" NOT NULL,
    "grade_after" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "observations" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "exam_participants_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'passed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."exam_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."exam_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "exam_date" "date" NOT NULL,
    "examiner_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "club_id" "uuid"
);


ALTER TABLE "public"."exam_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."member_achievements" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "member_id" "uuid" NOT NULL,
    "club_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "achievement_type" "text" NOT NULL,
    "date" "date" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."member_achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "club_id" "uuid" NOT NULL,
    "member_number" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "birth_date" "date" NOT NULL,
    "entry_date" "date" DEFAULT "now"(),
    "gender" "text",
    "grade" "text",
    "photo_url" "text",
    "phone" "text",
    "email" "text",
    "address" "text",
    "emergency_name" "text",
    "emergency_phone" "text",
    "emergency_relationship" "text",
    "allergies" "text",
    "injuries" "text",
    "medical_notes" "text",
    "coach_notes" "text",
    "active" boolean,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "member_status" "text" DEFAULT 'active'::"text",
    CONSTRAINT "members_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'other'::"text"]))),
    CONSTRAINT "members_status_check" CHECK (("member_status" = ANY (ARRAY['active'::"text", 'suspended_sick'::"text", 'suspended_vacation'::"text"])))
);


ALTER TABLE "public"."members" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."members_with_last_attendance" WITH ("security_invoker"='true') AS
 SELECT "id",
    "club_id",
    "member_number",
    "first_name",
    "last_name",
    "birth_date",
    "entry_date",
    "gender",
    "grade",
    "photo_url",
    "phone",
    "email",
    "address",
    "emergency_name",
    "emergency_phone",
    "emergency_relationship",
    "allergies",
    "injuries",
    "medical_notes",
    "coach_notes",
    "active",
    "created_at",
    "member_status" AS "status",
    ( SELECT "max"("a"."attendance_date") AS "max"
           FROM "public"."attendances" "a"
          WHERE (("a"."member_id" = "m"."id") AND ("a"."status" = 'present'::"text"))) AS "last_attendance_date"
   FROM "public"."members" "m";


ALTER VIEW "public"."members_with_last_attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payment_reference_id" "uuid" NOT NULL,
    "changed_by" "uuid",
    "old_status" "text",
    "new_status" "text",
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_references" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reference" "text" NOT NULL,
    "club_id" "uuid" NOT NULL,
    "amount" numeric,
    "status" "text" DEFAULT 'pending'::"text",
    "provider" "text" DEFAULT 'PAPI'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_references" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "club_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "subscription_id" "uuid",
    "amount" numeric NOT NULL,
    "payment_date" "date" DEFAULT "now"(),
    "payment_method" "text" NOT NULL,
    "billing_period" "text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pending_tariff_updates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "club_id" "uuid" NOT NULL,
    "old_tariff" numeric NOT NULL,
    "new_tariff" numeric NOT NULL,
    "member_count" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pending_tariff_updates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_instances" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "instance_date" "date" NOT NULL,
    "is_validated" boolean DEFAULT false,
    "club_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."session_instances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "club_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "day_of_week" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "club_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "price" numeric NOT NULL,
    "total_credits" integer,
    "used_credits" integer DEFAULT 0,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subscriptions_type_check" CHECK (("type" = ANY (ARRAY['unlimited'::"text", 'sessions'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_admins" (
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'super_admin'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_anomalies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "club_id" "uuid",
    "message" "text" NOT NULL,
    "metadata" "jsonb",
    "resolved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_anomalies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "club_id" "uuid",
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_logs" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vw_revenus_par_tarif" WITH ("security_invoker"='true') AS
 SELECT
        CASE
            WHEN ("amount" = (10000)::numeric) THEN 'Débutant (10k)'::"text"
            WHEN ("amount" = (20000)::numeric) THEN 'Standard (20k)'::"text"
            WHEN ("amount" = (35000)::numeric) THEN 'Elite (35k)'::"text"
            ELSE 'Autre'::"text"
        END AS "palier_tarif",
    "count"(DISTINCT "club_id") AS "effectif_clubs",
    "sum"("amount") AS "revenu_total"
   FROM "public"."payment_references"
  WHERE ("status" = 'paid'::"text")
  GROUP BY
        CASE
            WHEN ("amount" = (10000)::numeric) THEN 'Débutant (10k)'::"text"
            WHEN ("amount" = (20000)::numeric) THEN 'Standard (20k)'::"text"
            WHEN ("amount" = (35000)::numeric) THEN 'Elite (35k)'::"text"
            ELSE 'Autre'::"text"
        END;


ALTER VIEW "public"."vw_revenus_par_tarif" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_logs"
    ADD CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendances"
    ADD CONSTRAINT "attendances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."club_settings"
    ADD CONSTRAINT "club_settings_club_id_key" UNIQUE ("club_id");



ALTER TABLE ONLY "public"."club_settings"
    ADD CONSTRAINT "club_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clubs"
    ADD CONSTRAINT "clubs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_participants"
    ADD CONSTRAINT "exam_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_sessions"
    ADD CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."member_achievements"
    ADD CONSTRAINT "member_achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_audit_logs"
    ADD CONSTRAINT "payment_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_references"
    ADD CONSTRAINT "payment_references_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_references"
    ADD CONSTRAINT "payment_references_reference_key" UNIQUE ("reference");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pending_tariff_updates"
    ADD CONSTRAINT "pending_tariff_updates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_instances"
    ADD CONSTRAINT "session_instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_instances"
    ADD CONSTRAINT "session_instances_session_id_instance_date_key" UNIQUE ("session_id", "instance_date");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_admins"
    ADD CONSTRAINT "system_admins_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."system_anomalies"
    ADD CONSTRAINT "system_anomalies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_logs"
    ADD CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "unique_member_in_club" UNIQUE ("club_id", "first_name", "last_name", "birth_date");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "unique_member_payment_period" UNIQUE ("club_id", "member_id", "billing_period");



CREATE INDEX "idx_achievements_club_date" ON "public"."member_achievements" USING "btree" ("club_id", "date" DESC);



CREATE INDEX "idx_attendances_date_member" ON "public"."attendances" USING "btree" ("attendance_date", "member_id");



CREATE INDEX "idx_attendances_session" ON "public"."attendances" USING "btree" ("session_id");



CREATE INDEX "idx_exam_sessions_club_id" ON "public"."exam_sessions" USING "btree" ("club_id");



CREATE INDEX "idx_member_achievements_club_id" ON "public"."member_achievements" USING "btree" ("club_id");



CREATE INDEX "idx_member_achievements_member_id" ON "public"."member_achievements" USING "btree" ("member_id");



CREATE INDEX "idx_members_club_id" ON "public"."members" USING "btree" ("club_id");



CREATE UNIQUE INDEX "idx_members_club_number" ON "public"."members" USING "btree" ("club_id", "member_number");



CREATE INDEX "idx_members_last_name" ON "public"."members" USING "btree" ("last_name");



CREATE INDEX "idx_payments_club_member_period" ON "public"."payments" USING "btree" ("club_id", "member_id", "billing_period");



CREATE OR REPLACE TRIGGER "trg_payment_status_change" AFTER UPDATE ON "public"."payment_references" FOR EACH ROW EXECUTE FUNCTION "public"."log_payment_status_change"();



CREATE OR REPLACE TRIGGER "trg_sync_member_active_status" BEFORE INSERT OR UPDATE ON "public"."members" FOR EACH ROW EXECUTE FUNCTION "public"."sync_member_active_status"();



CREATE OR REPLACE TRIGGER "trg_update_tier_price" AFTER INSERT OR DELETE OR UPDATE ON "public"."members" FOR EACH ROW EXECUTE FUNCTION "public"."update_club_tier_price_func"();



CREATE OR REPLACE TRIGGER "trigger_update_member_grade" AFTER UPDATE ON "public"."exam_participants" FOR EACH ROW WHEN ((("new"."status" = 'passed'::"text") AND ("old"."status" <> 'passed'::"text"))) EXECUTE FUNCTION "public"."update_member_grade"();



ALTER TABLE ONLY "public"."admin_logs"
    ADD CONSTRAINT "admin_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."attendances"
    ADD CONSTRAINT "attendances_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendances"
    ADD CONSTRAINT "attendances_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendances"
    ADD CONSTRAINT "attendances_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attendances"
    ADD CONSTRAINT "attendances_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."club_settings"
    ADD CONSTRAINT "club_settings_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clubs"
    ADD CONSTRAINT "clubs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."exam_participants"
    ADD CONSTRAINT "exam_participants_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_participants"
    ADD CONSTRAINT "exam_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."exam_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_sessions"
    ADD CONSTRAINT "exam_sessions_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_achievements"
    ADD CONSTRAINT "member_achievements_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_achievements"
    ADD CONSTRAINT "member_achievements_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_audit_logs"
    ADD CONSTRAINT "payment_audit_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payment_audit_logs"
    ADD CONSTRAINT "payment_audit_logs_payment_reference_id_fkey" FOREIGN KEY ("payment_reference_id") REFERENCES "public"."payment_references"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_references"
    ADD CONSTRAINT "payment_references_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pending_tariff_updates"
    ADD CONSTRAINT "pending_tariff_updates_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_instances"
    ADD CONSTRAINT "session_instances_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_instances"
    ADD CONSTRAINT "session_instances_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."system_admins"
    ADD CONSTRAINT "system_admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."system_anomalies"
    ADD CONSTRAINT "system_anomalies_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."system_logs"
    ADD CONSTRAINT "system_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."system_logs"
    ADD CONSTRAINT "system_logs_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE CASCADE;



CREATE POLICY "Accès SuperAdmin audit" ON "public"."payment_audit_logs" USING (("auth"."uid"() = 'd6d7f43d-a2f7-477a-99f2-e6a98f410af1'::"uuid"));



CREATE POLICY "Accès SuperAdmin aux paiements" ON "public"."payment_references" FOR SELECT USING (("auth"."uid"() = 'd6d7f43d-a2f7-477a-99f2-e6a98f410af1'::"uuid"));



CREATE POLICY "Accès SuperAdmin logs" ON "public"."system_anomalies" USING (("auth"."uid"() = 'd6d7f43d-a2f7-477a-99f2-e6a98f410af1'::"uuid"));



CREATE POLICY "Accès SuperAdmin pending_tariff" ON "public"."pending_tariff_updates" USING ("public"."is_superadmin"());



CREATE POLICY "Accès SuperAdmin system_logs" ON "public"."system_logs" USING ("public"."is_superadmin"());



CREATE POLICY "Accès administrateur" ON "public"."system_admins" USING (("auth"."uid"() = 'd6d7f43d-a2f7-477a-99f2-e6a98f410af1'::"uuid"));



CREATE POLICY "Accès attendances" ON "public"."attendances" USING ((("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))) OR "public"."is_superadmin"()));



CREATE POLICY "Accès aux instances de séances" ON "public"."session_instances" USING (("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Accès aux présences" ON "public"."attendances" USING (("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Accès aux séances" ON "public"."sessions" USING (("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Accès club_settings pour le propriétaire" ON "public"."club_settings" USING (("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Accès clubs" ON "public"."clubs" USING ((("owner_id" = "auth"."uid"()) OR "public"."is_superadmin"())) WITH CHECK ((("owner_id" = "auth"."uid"()) OR "public"."is_superadmin"()));



CREATE POLICY "Accès complet aux paiements pour le propriétaire" ON "public"."payments" USING (("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"())))) WITH CHECK (("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Accès complet aux subscriptions pour le propriétaire" ON "public"."subscriptions" USING (("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"())))) WITH CHECK (("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Accès membres unifié" ON "public"."members" USING (((("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))) OR "public"."is_superadmin"()) AND "public"."is_club_active"("club_id"))) WITH CHECK ((("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))) OR "public"."is_superadmin"()));



CREATE POLICY "Accès payment_references" ON "public"."payment_references" USING ((("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))) OR "public"."is_superadmin"()));



CREATE POLICY "Accès payments" ON "public"."payments" USING ((("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))) OR "public"."is_superadmin"()));



CREATE POLICY "Accès sessions" ON "public"."sessions" USING ((("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))) OR "public"."is_superadmin"()));



CREATE POLICY "Accès subscriptions" ON "public"."subscriptions" USING ((("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))) OR "public"."is_superadmin"()));



CREATE POLICY "Accès sécurisé exam_participants" ON "public"."exam_participants" USING ((("member_id" IN ( SELECT "m"."id"
   FROM ("public"."members" "m"
     JOIN "public"."clubs" "c" ON (("m"."club_id" = "c"."id")))
  WHERE ("c"."owner_id" = "auth"."uid"()))) OR "public"."is_superadmin"())) WITH CHECK ((("member_id" IN ( SELECT "m"."id"
   FROM ("public"."members" "m"
     JOIN "public"."clubs" "c" ON (("m"."club_id" = "c"."id")))
  WHERE ("c"."owner_id" = "auth"."uid"()))) OR "public"."is_superadmin"()));



CREATE POLICY "Accès sécurisé member_achievements" ON "public"."member_achievements" USING ((("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))) OR "public"."is_superadmin"())) WITH CHECK ((("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))) OR "public"."is_superadmin"()));



CREATE POLICY "Autoriser insertion si club actif" ON "public"."attendances" FOR INSERT WITH CHECK ("public"."is_club_active"("club_id"));



CREATE POLICY "Autoriser insertion si club actif" ON "public"."sessions" FOR INSERT WITH CHECK ("public"."is_club_active"("club_id"));



CREATE POLICY "Autoriser la lecture des sessions" ON "public"."exam_sessions" FOR SELECT USING (("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Autoriser modification si club actif" ON "public"."attendances" FOR UPDATE USING ("public"."is_club_active"("club_id"));



CREATE POLICY "Autoriser modification si club actif" ON "public"."sessions" FOR UPDATE USING ("public"."is_club_active"("club_id"));



CREATE POLICY "Autoriser suppression si club actif" ON "public"."attendances" FOR DELETE USING ("public"."is_club_active"("club_id"));



CREATE POLICY "Autoriser suppression si club actif" ON "public"."sessions" FOR DELETE USING ("public"."is_club_active"("club_id"));



CREATE POLICY "Insertion sécurisée des sessions" ON "public"."exam_sessions" FOR INSERT WITH CHECK (("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Lecture propre ligne" ON "public"."system_admins" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Lecture sessions" ON "public"."exam_sessions" FOR SELECT USING (true);



CREATE POLICY "Les admins peuvent se lire" ON "public"."system_admins" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Modification réservée SuperAdmin" ON "public"."exam_sessions" USING ("public"."is_superadmin"()) WITH CHECK ("public"."is_superadmin"());



CREATE POLICY "Propriétaire peut lire ses paiements" ON "public"."payment_references" FOR SELECT USING (("club_id" IN ( SELECT "clubs"."id"
   FROM "public"."clubs"
  WHERE ("clubs"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Public read access for system_admins" ON "public"."system_admins" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Super admins only logs" ON "public"."admin_logs" USING ((EXISTS ( SELECT 1
   FROM "public"."system_admins"
  WHERE ("system_admins"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."admin_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attendances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."club_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clubs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exam_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exam_sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "lecture_participants" ON "public"."exam_participants" FOR SELECT USING (true);



CREATE POLICY "lecture_sessions" ON "public"."exam_sessions" FOR SELECT USING (true);



ALTER TABLE "public"."member_achievements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_references" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pending_tariff_updates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."session_instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_anomalies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_logs" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."add_payments_atomic_v2"("p_club_id" "uuid", "p_member_id" "uuid", "p_subscription_id" "uuid", "p_payments" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."add_payments_atomic_v2"("p_club_id" "uuid", "p_member_id" "uuid", "p_subscription_id" "uuid", "p_payments" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_payments_atomic_v2"("p_club_id" "uuid", "p_member_id" "uuid", "p_subscription_id" "uuid", "p_payments" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."apply_automatic_tariff_updates"() TO "anon";
GRANT ALL ON FUNCTION "public"."apply_automatic_tariff_updates"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."apply_automatic_tariff_updates"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_tier_price"("member_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_tier_price"("member_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_tier_price"("member_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_tariff_updates"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_tariff_updates"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_tariff_updates"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_member_number"("p_club_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_member_number"("p_club_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_member_number"("p_club_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_subscription_with_payments"("p_member_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_subscription_with_payments"("p_member_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_subscription_with_payments"("p_member_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_club_active"("club_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_club_active"("club_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_club_active"("club_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_superadmin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_superadmin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_superadmin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_superadmin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_payment_status_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_payment_status_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_payment_status_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_member_active_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_member_active_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_member_active_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_club_tier_price_func"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_club_tier_price_func"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_club_tier_price_func"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_member_grade"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_member_grade"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_member_grade"() TO "service_role";



GRANT ALL ON TABLE "public"."admin_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_logs" TO "service_role";



GRANT ALL ON TABLE "public"."attendances" TO "anon";
GRANT ALL ON TABLE "public"."attendances" TO "authenticated";
GRANT ALL ON TABLE "public"."attendances" TO "service_role";



GRANT ALL ON TABLE "public"."club_settings" TO "anon";
GRANT ALL ON TABLE "public"."club_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."club_settings" TO "service_role";



GRANT ALL ON TABLE "public"."clubs" TO "anon";
GRANT ALL ON TABLE "public"."clubs" TO "authenticated";
GRANT ALL ON TABLE "public"."clubs" TO "service_role";



GRANT ALL ON TABLE "public"."exam_participants" TO "anon";
GRANT ALL ON TABLE "public"."exam_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_participants" TO "service_role";



GRANT ALL ON TABLE "public"."exam_sessions" TO "anon";
GRANT ALL ON TABLE "public"."exam_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."member_achievements" TO "anon";
GRANT ALL ON TABLE "public"."member_achievements" TO "authenticated";
GRANT ALL ON TABLE "public"."member_achievements" TO "service_role";



GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";



GRANT ALL ON TABLE "public"."members_with_last_attendance" TO "anon";
GRANT ALL ON TABLE "public"."members_with_last_attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."members_with_last_attendance" TO "service_role";



GRANT ALL ON TABLE "public"."payment_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."payment_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."payment_references" TO "anon";
GRANT ALL ON TABLE "public"."payment_references" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_references" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."pending_tariff_updates" TO "anon";
GRANT ALL ON TABLE "public"."pending_tariff_updates" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_tariff_updates" TO "service_role";



GRANT ALL ON TABLE "public"."session_instances" TO "anon";
GRANT ALL ON TABLE "public"."session_instances" TO "authenticated";
GRANT ALL ON TABLE "public"."session_instances" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."system_admins" TO "anon";
GRANT ALL ON TABLE "public"."system_admins" TO "authenticated";
GRANT ALL ON TABLE "public"."system_admins" TO "service_role";



GRANT ALL ON TABLE "public"."system_anomalies" TO "anon";
GRANT ALL ON TABLE "public"."system_anomalies" TO "authenticated";
GRANT ALL ON TABLE "public"."system_anomalies" TO "service_role";



GRANT ALL ON TABLE "public"."system_logs" TO "anon";
GRANT ALL ON TABLE "public"."system_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."system_logs" TO "service_role";



GRANT ALL ON TABLE "public"."vw_revenus_par_tarif" TO "anon";
GRANT ALL ON TABLE "public"."vw_revenus_par_tarif" TO "authenticated";
GRANT ALL ON TABLE "public"."vw_revenus_par_tarif" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







