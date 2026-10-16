# 14: Afficher un pseudo plutôt que l'adresse e-mail

**Status:** needs-triage
**Category:** enhancement
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16) ; à confirmer au triage._

**Constat :** mon adresse e-mail est le seul nom que les autres joueurs voient de moi, sur la page Trade comme dans le Chat. Tout partenaire d'échange peut donc lire mon e-mail, ce qui pose un problème de confidentialité. C'est aussi un nom peu lisible.

- [ ] À l'inscription, je choisis un pseudo unique, que je peux modifier ensuite.
- [ ] Les comptes existants reçoivent un pseudo par défaut ; la règle est à définir au triage.
- [ ] Les autres joueurs ne voient que mon pseudo : l'API ne leur transmet plus mon e-mail.
- [ ] Le schéma change par une nouvelle migration, et le contrat de l'API est mis à jour côté serveur et côté client.

Voir aussi : 03.
