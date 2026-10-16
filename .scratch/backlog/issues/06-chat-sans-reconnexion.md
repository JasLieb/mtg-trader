# 06: Le chat ne se reconnecte pas après une coupure

**Status:** needs-triage
**Category:** bug
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16), sans reproduction ; à confirmer au triage._

**Constat :** la connexion temps réel peut être coupée par le réseau, par un redéploiement de l'API ou par la mise en veille du service gratuit Render (après 15 minutes sans trafic). Le chat cesse alors de recevoir et d'envoyer des messages, sans rien afficher, et il faut recharger la page.

**Cause repérée :** la connexion au hub est ouverte une seule fois, sans reconnexion automatique. Les échecs d'envoi ne sont visibles que dans la console.

- [ ] Après une coupure, le chat se reconnecte tout seul et récupère les messages arrivés entre-temps.
- [ ] Pendant la coupure, l'utilisateur voit que le chat est hors ligne.
- [ ] Un message dont l'envoi échoue est signalé à l'utilisateur.

Voir aussi : 05 (une reconnexion avec un jeton expiré échouera), 12.
