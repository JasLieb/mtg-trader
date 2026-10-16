# 12: La base de production est déclarée sur l'offre gratuite de Render, qui expire

**Status:** needs-info
**Category:** bug
**Blocked by:** None (can start immediately)

_Rédigé par IA le 2026-10-16 ; conditions vérifiées le même jour sur la documentation de l'offre gratuite de Render._

**Constat :** `render.yaml` déclare la base PostgreSQL de production en offre gratuite. Chez Render, une base gratuite :
- expire 30 jours après sa création ;
- est supprimée avec toutes ses données 14 jours plus tard, si elle n'est pas passée à une offre payante ;
- n'a aucune sauvegarde.

Le service API gratuit se met aussi en veille après 15 minutes sans trafic et met environ une minute à redémarrer.

**Question pour le mainteneur :** la production tourne-t-elle toujours sur cette offre ? Si oui, les comptes, les listes et les messages des joueurs peuvent disparaître.

- [ ] Le mainteneur confirme l'offre utilisée en production.
- [ ] Si c'est l'offre gratuite : choisir une offre avec sauvegardes et mettre `render.yaml` à jour. C'est un fichier de déploiement, donc la modification demande l'accord du mainteneur.

Voir aussi : 06 (mise en veille et coupure du chat).
