# 05: La session expire au bout d'une heure sans que l'utilisateur soit prévenu

**Status:** needs-triage
**Category:** bug
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16), sans reproduction ; à confirmer au triage._

**Constat :** le jeton de connexion est valable une heure. Passé ce délai, l'application s'affiche toujours comme connectée, mais les créations, ajouts et suppressions échouent sans aucun message : l'erreur part seulement dans la console. L'utilisateur n'est renvoyé vers la page de connexion qu'au rechargement suivant.

**Cause repérée :** le client ne traite aucune réponse 401 en cours de session.

- [ ] Quand l'API répond 401, l'utilisateur est déconnecté proprement et renvoyé vers la page de connexion, avec un message expliquant que sa session a expiré.
- [ ] Ce qu'il était en train de faire n'est pas perdu sans avertissement.

**Décision à prendre :** faut-il aussi allonger la session, par exemple avec un jeton de rafraîchissement ? Cela touche à l'émission et à la validation des JWT, donc à valider avec le mainteneur.

Voir aussi : 06.
