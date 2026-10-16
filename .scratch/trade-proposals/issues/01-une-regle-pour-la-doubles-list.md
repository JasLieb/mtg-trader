# 01: Une seule règle pour reconnaître la Doubles list

**What to build:** une préparation sans changement visible pour les Users. Aujourd'hui, la règle qui reconnaît la Doubles list d'un User est recopiée à plusieurs endroits du serveur, et le client en applique une autre, plus large : « double » n'importe où dans l'identifiant. De chaque côté, une seule définition dit comment se forme l'identifiant de la Doubles list d'un User (`{userId}_doubles`), comment on la reconnaît (le suffixe `_doubles`) et comment on l'obtient pour un User donné. Tout le code existant passe par elle. Les tickets suivants s'en servent pour valider, lire et modifier des Doubles lists. Ce ticket reprend le ticket backlog 19 (`.scratch/backlog/issues/19-unifier-detection-liste-de-doubles.md`).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Côté serveur comme côté client, la règle est définie une seule fois, et tout le code qui distingue la Doubles list des Wantlists l'utilise.
- [ ] Des tests couvrent un identifiant qui contient « double » sans se terminer par `_doubles` : il désigne une Wantlist.
- [ ] Le comportement de l'application ne change pas : les tests existants passent sans que leurs attentes soient modifiées.
