# KARATIX - Gestion des abonnements SaaS
## Version 1.0 (Spécification Fonctionnelle)

---

# 1. Objectif

Le système d'abonnement de KARATIX permet aux clubs de karaté :

- Créer un compte gratuitement.
- Profiter d'une période d'essai de 14 jours.
- Utiliser toutes les fonctionnalités durant cette période.
- Payer un abonnement uniquement à la fin de l'essai.
- Calculer automatiquement le prix selon le nombre de membres.
- Gérer les renouvellements automatiquement.
- Bloquer uniquement les fonctionnalités d'écriture en cas d'expiration.

---

# 2. Période d'essai

Chaque nouveau club bénéficie automatiquement de :

- 14 jours d'essai
- Aucune carte bancaire demandée
- Aucun paiement demandé
- Toutes les fonctionnalités disponibles

Statut du club : **TRIAL**

Le Super Admin voit :

- Date de création
- Date d'expiration de l'essai
- Nombre de jours restants
- Nombre de membres créés

---

# 3. Tarification

Le prix est calculé selon le nombre de membres actifs.

| Nombre de membres | Prix mensuel |
|------------------|-------------:|
| 1 à 30 | 10 000 Ar |
| 31 à 70 | 20 000 Ar |
| 71 à 100 | 35 000 Ar |
| Plus de 100 | 50 000 Ar |

Le calcul est effectué uniquement :

- à la fin de l'essai
- au renouvellement mensuel

---

# 4. Fin de la période d'essai

Le 14ème jour :

KARATIX compte automatiquement le nombre de membres actifs. Le système calcule le plan approprié et affiche le montant à payer.

---

# 5. Paiement

Utilisation de l'API Papi.

- **Flux :** Création paiement -> Redirection Papi -> Paiement -> Webhook de retour.
- **Sécurité :** Seul le Webhook officiel de Papi valide définitivement l'abonnement.

---

# 6. Activation

Après validation du paiement par Webhook :

- Statut : **ACTIVE**
- Début : Date du paiement
- Fin : +30 jours

---

# 7. Capacité maximale du plan

Chaque abonnement donne droit à une capacité maximale de membres (ex: plan 31-70 -> max 70 membres).

---

# 8. Ajout de nouveaux membres

Pendant l'abonnement : ajout illimité de membres jusqu'à la limite du plan acheté.

---

# 9. Dépassement de la capacité

Blocage de l'ajout si la limite est atteinte. Message d'invitation à passer au plan supérieur.

---

# 10. Renouvellement

Recalcul automatique du plan basé sur l'effectif actuel le jour du renouvellement.

---

# 11. Expiration

Si aucun paiement n'est reçu :

- Statut : **EXPIRED**
- Mode : **LECTURE SEULE** (plus d'ajouts/modifications/enregistrements).

---

# 12. Réactivation

Dès paiement validé : retour au statut **ACTIVE** et accès complet.

---

# 13. Tableau de bord du Super Admin

Vue consolidée : clubs (statut, essai, actif, expiré, revenu mensuel, historique).

---

# 14. Historique des abonnements

Enregistrement immuable de chaque transaction (Club, Dates, Membres au calcul, Plan, Prix, Référence, Moyen de paiement, Statut).

---

# 15. Règles métier

Résumé : Essai 14j, paiement Papi via Webhook obligatoire, calcul automatique, tarif figé durant la période, mode lecture seule en expiration, conservation des données.
