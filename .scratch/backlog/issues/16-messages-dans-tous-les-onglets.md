# 16: Recevoir les messages dans tous les onglets et sur tous les appareils

**Status:** needs-triage
**Category:** enhancement
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16) ; à confirmer au triage._

**Constat :** quand l'application est ouverte dans plusieurs onglets ou sur plusieurs appareils, seule la première connexion reçoit les messages en direct. Les autres ne les voient qu'après un rechargement. Pour la même raison, la livraison en direct ne fonctionne que si l'API tourne sur une seule instance : le registre des connexions est gardé en mémoire et ne retient qu'une connexion par joueur.

**Piste :** SignalR sait joindre toutes les connexions d'un même utilisateur à partir de son identifiant, ce qui rendrait ce registre inutile.

- [ ] Un message reçu apparaît en direct dans tous les onglets ouverts du destinataire.
- [ ] Un message que j'envoie apparaît aussi dans mes autres onglets.
