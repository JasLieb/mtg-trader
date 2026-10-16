# 17: Vérifier l'e-mail et le mot de passe à l'inscription

**Status:** needs-triage
**Category:** enhancement
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16) ; à confirmer au triage._

**Constat :** l'inscription accepte n'importe quel texte comme e-mail et n'importe quel mot de passe, même d'un seul caractère. Ni le client ni l'API ne vérifient ces champs ; ils doivent seulement être non vides.

- [ ] Le formulaire refuse un e-mail mal formé et un mot de passe trop court, avec un message clair sous le champ concerné.
- [ ] L'API applique les mêmes règles de son côté et répond par une erreur explicite (400), même si le client est contourné.
- [ ] La règle de mot de passe est à fixer au triage : longueur minimale, et peut-être d'autres critères.
