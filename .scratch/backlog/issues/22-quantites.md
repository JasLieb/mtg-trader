# 22: Indiquer le nombre d'exemplaires d'une carte

**Status:** needs-triage
**Category:** enhancement
**Blocked by:** None (can start immediately)

_Rédigé par IA le 2026-10-16 ; idée de fonctionnalité à discuter au triage._

**Constat :** une liste indique seulement si une carte y figure, sans dire combien d'exemplaires je cherche ou combien j'en ai en double. Si j'ajoute deux fois la même carte, un seul exemplaire est enregistré.

- [ ] Je peux indiquer un nombre d'exemplaires pour chaque carte de mes wantlists et de mes doubles.
- [ ] Pour chaque carte, la page Trade affiche la quantité échangeable : le plus petit des deux nombres entre ce que l'un cherche et ce que l'autre a en double.
- [ ] Le schéma change par une nouvelle migration, et les cartes déjà enregistrées comptent pour un exemplaire.

## Comments

- 2026-10-16 (grilling du 26, `.scratch/trade-proposals/spec.md`) : le 26 sort d'abord, avec un exemplaire par Card. Le 22 reprend trois points :
  - une quantité sur chaque ligne de Trade proposal ;
  - le verrou des exemplaires engagés : disponible = exemplaires en double − exemplaires engagés dans une proposition en attente ou dans un Trade dont l'étape de retrait n'est pas passée. Une proposition ne peut plus dépasser ce disponible ;
  - à réexaminer : le retrait automatique des Cards à l'acceptation, écarté dans le 26 faute de quantités.
