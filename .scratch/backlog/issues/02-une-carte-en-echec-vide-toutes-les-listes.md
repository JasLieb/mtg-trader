# 02: Une seule carte non chargée depuis Scryfall vide toutes les listes

**Status:** needs-triage
**Category:** bug
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16), sans reproduction ; à confirmer au triage._

**Constat :** il suffit que Scryfall ne renvoie pas une seule des cartes de mes listes pour qu'aucune wantlist ni la liste de doubles ne s'affiche. Cela arrive quand une carte a été retirée, en cas d'erreur réseau ou quand la limite de débit est dépassée. Tant que cette carte échoue, mes modifications suivantes ne mettent plus l'écran à jour non plus.

**Cause repérée :** une carte en échec devient une valeur vide dans le tableau des cartes chargées. En reconstruisant les listes, le client lit l'identifiant de cette valeur vide, ce qui lève une erreur et interrompt toute la mise à jour de l'état.

- [ ] Une carte que Scryfall ne renvoie pas n'empêche pas l'affichage des autres cartes ni des autres listes.
- [ ] L'utilisateur voit qu'une carte n'a pas pu être chargée.
- [ ] La carte en échec reste dans la liste côté serveur : la sauvegarde suivante ne doit pas la supprimer.
- [ ] Un test simule l'échec du chargement d'une carte.

Voir aussi : 13 (réduire les appels à Scryfall réduit aussi les échecs).
