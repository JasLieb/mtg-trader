# 07: Afficher la valeur en euros de chaque côté d'une Trade proposal

**What to build:**
- **Dans le formulaire**, le total en euros de ce que je donne et de ce que je reçois s'affiche et se met à jour à chaque case cochée ou décochée.
- **Sur la page Proposals**, chaque proposition affiche les mêmes totaux.
- **Prix utilisés** : ceux de Scryfall au moment de l'affichage. Ils ne sont jamais envoyés au serveur ni enregistrés.
- **Card sans prix** : elle est signalée dans le total de son côté, et non comptée pour 0 €.
- **Réutilisation** : le calcul des totaux doit pouvoir resservir au ticket backlog 24, pour la page Trade.

Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Scénario 11 de la spec : une Card sans prix Scryfall est marquée comme telle dans le total de son côté.
- [ ] Dans le formulaire, les totaux suivent les cases cochées.
- [ ] Aucune requête vers le serveur ne transporte de prix.
