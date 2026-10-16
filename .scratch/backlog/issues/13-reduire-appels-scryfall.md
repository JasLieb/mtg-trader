# 13: Réduire le nombre d'appels à Scryfall

**Status:** needs-triage
**Category:** enhancement
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16). La documentation de Scryfall n'était pas accessible au moment de la rédaction : limites et endpoint à confirmer._

**Constat :** le client fait deux appels à Scryfall par carte affichée : l'un pour la carte, l'autre pour la liste de toutes ses éditions. Après chaque ajout ou retrait, il recharge toutes les cartes de toutes mes listes. Une collection de 50 cartes déclenche donc une centaine d'appels simultanés à chaque modification. Une recherche lance aussi un appel par résultat. Scryfall demande de limiter le débit et refuse les requêtes au-delà (code 429). Les pages sont lentes, et à cause de 02, elles peuvent même rester vides.

**Pistes :**
- Scryfall propose un endpoint qui renvoie un lot de cartes, jusqu'à 75 il me semble, à partir de leurs identifiants.
- Les éditions ne servent qu'à la boîte de changement d'édition, et peuvent n'être chargées qu'à son ouverture.
- Les cartes déjà chargées peuvent rester en cache dans `CardService`. Scryfall reste la seule source des données de cartes.

- [ ] Le chargement des listes regroupe les cartes par lots au lieu de faire deux appels par carte.
- [ ] Ajouter ou retirer une carte ne recharge pas les cartes déjà connues.
- [ ] Les éditions d'une carte ne sont chargées qu'à l'ouverture de la boîte de changement d'édition.
- [ ] Une recherche ne fait qu'un seul appel à Scryfall.

Voir aussi : 02.
