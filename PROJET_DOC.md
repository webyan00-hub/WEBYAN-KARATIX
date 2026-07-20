# Documentation du Projet KARATIX SaaS

## 1. Structure de la Base de Données (Supabase)
La base de données suit des contraintes strictes. Toute modification doit respecter ces règles pour éviter les erreurs d'insertion :

- **Table `members`** :
    - `gender` : Accepte uniquement les valeurs suivantes : `'male'`, `'female'`, `'other'`.
    - `member_status` : Accepte uniquement : `'active'`, `'suspended_sick'`, `'suspended_vacation'`.
- **Isolation des données** : Toutes les tables principales (`clubs`, `members`, `sessions`, `attendances`) utilisent le **RLS (Row Level Security)** pour isoler les données par `club_id`.

## 2. Déploiement et CI/CD (Vercel)
- **Root Directory** : Doit être configuré sur `frontend` dans les paramètres Vercel.
- **Gestion des Dépendances** :
    - En cas de conflit de dépendances (`ERESOLVE`), utiliser la commande d'installation : `npm install --legacy-peer-deps`.
    - Cette commande est configurée dans le `package.json` via le script `"install:clean"`.
- **Routage SPA (Single Page Application)** :
    - Un fichier `vercel.json` est présent à la racine du dossier `frontend` pour rediriger toutes les requêtes vers `index.html` et permettre à `react-router-dom` de gérer les routes.
- **Variables d'environnement** :
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - Doivent être définies dans le Dashboard Vercel.

## 3. Guide de résolution d'erreurs fréquentes
- **Build Failed (Vite/Rolldown)** : Souvent dû à une dépendance utilisée dans le code mais manquante dans `package.json`.
    - *Action* : Ajouter la dépendance (`npm install <package>`), puis pousser le changement.
- **Filtres non fonctionnels** : Vérifier que les valeurs envoyées par le frontend correspondent aux contraintes `CHECK` dans le SQL de la base de données.
- **Warning LF/CRLF** : Inoffensif sous Windows, ignoré par Git via la configuration `git config --global core.autocrlf true`.
