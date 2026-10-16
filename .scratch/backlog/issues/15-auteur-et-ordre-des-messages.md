# 15: Montrer qui a écrit chaque message et trier les messages par date

**Status:** needs-triage
**Category:** enhancement
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16) ; à confirmer au triage._

**Constat :** dans une conversation, chaque message n'affiche que sa date et son texte, sans indiquer qui l'a écrit. L'ordre de l'historique n'est pas garanti non plus : le serveur ne trie pas les messages, et le tri prévu côté client n'est pas utilisé. Il échouerait d'ailleurs en l'état, car les dates arrivent sous forme de texte.

- [ ] Mes messages se distinguent visuellement de ceux de l'autre joueur, par l'alignement, la couleur ou le nom.
- [ ] Les messages s'affichent toujours dans l'ordre chronologique, y compris après un rechargement.
