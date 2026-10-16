# 07: La page Trade n'est pas mise à jour après une modification des listes

**Status:** needs-triage
**Category:** bug
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16), sans reproduction ; à confirmer au triage._

**Constat :** la liste des partenaires d'échange est chargée une seule fois par session. Si j'ajoute ou retire une carte de mes wantlists ou de mes doubles, ni la page Trade ni les rappels de cartes du Chat ne changent avant un rechargement de la page. Les changements faits par les autres joueurs n'apparaissent pas non plus.

**Cause repérée :** le résultat de la recherche d'échanges est mis en cache pour toute la durée de vie de l'application.

- [ ] Chaque ouverture de la page Trade affiche des échanges calculés sur l'état actuel des listes.
- [ ] Une modification de mes wantlists ou de mes doubles est prise en compte sans recharger la page.

Voir aussi : 01 (même cause : des données chargées une seule fois).
