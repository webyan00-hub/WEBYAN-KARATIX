-- SQL à exécuter dans Supabase pour créer une vue simplifiant la récupération des membres avec leur dernière présence
CREATE OR REPLACE VIEW members_with_last_attendance AS
SELECT 
    m.*,
    (SELECT MAX(attendance_date) 
     FROM attendances 
     WHERE attendances.member_id = m.id 
     AND attendances.status = 'present') as last_attendance_date
FROM members m;
