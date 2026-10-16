# 19: Utiliser la même règle partout pour reconnaître la liste de doubles

**Status:** needs-triage
**Category:** enhancement
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16) ; à confirmer au triage._

**Constat :** pour reconnaître la liste de doubles, le serveur regarde si l'identifiant se termine par `_doubles`, alors que le client cherche « double » n'importe où dans l'identifiant. Les deux règles ne donnent le même résultat aujourd'hui que parce que les autres identifiants sont des GUID.

**Pour l'utilisateur :** aucun changement visible. Cela évite qu'une future évolution des identifiants fasse passer une wantlist pour la liste de doubles.

- [ ] Les deux côtés n'utilisent qu'une seule règle, le suffixe `_doubles`, définie à un seul endroit de chaque côté.
- [ ] Les tests couvrent un identifiant qui contient « double » sans se terminer par `_doubles`.
