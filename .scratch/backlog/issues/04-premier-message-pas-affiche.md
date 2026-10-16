# 04: Le premier message d'une nouvelle conversation n'apparaît qu'après un rechargement

**Status:** needs-triage
**Category:** bug
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16), sans reproduction ; à confirmer au triage._

**Constat :** je contacte un joueur pour la première fois avec le bouton « Send a message » de la page Trade, puis j'envoie un message. Le message est enregistré, mais il ne s'affiche pas dans la conversation. Le destinataire, même connecté, ne le reçoit pas en direct non plus. Le message n'apparaît des deux côtés qu'après un rechargement de la page.

**Cause repérée :** le client n'ajoute un message reçu en direct qu'aux conversations qui existaient dans l'historique chargé à la connexion. Une conversation nouvelle n'y figure pas, donc le message est ignoré.

- [ ] Le premier message d'une nouvelle conversation s'affiche immédiatement chez l'expéditeur.
- [ ] Le destinataire connecté voit la nouvelle conversation et le message apparaître sans recharger la page.
- [ ] Un test couvre la réception d'un message pour une conversation absente de l'historique.

Voir aussi : 03 (le destinataire doit aussi pouvoir voir les conversations hors partenaires).
