# 10: Compteur des propositions reçues et lien vers la conversation

**What to build:**
- **Compteur.** L'entrée Proposals du menu affiche le nombre de propositions que j'ai reçues et qui sont en attente. Il se met à jour au chargement de l'application et à chaque navigation. Il n'y a pas de temps réel ; c'est le sujet des tickets backlog 16 et 25.
- **Lien vers la conversation.** Sur la page Proposals, chaque proposition mène à la conversation avec l'autre User.
- **Limite connue.** Tant que le ticket backlog 03 n'est pas corrigé, la page Chat n'affiche pas la conversation avec un User qui n'est plus Trade partner.

Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 03

**Status:** done

- [x] Scénario 1 de la spec : après l'envoi, le compteur de Bob passe à 1. Il revient à 0 une fois que Bob a répondu.
- [x] Une fois le ticket 06 livré, les propositions expirées ne sont plus comptées.
- [x] Le lien ouvre la conversation avec l'autre User, à condition que les deux soient Trade partners.

## Comments

- 2026-10-16 : implémenté, non commité.
  - Client : `TradeProposalService` expose `pendingReceivedCount$`, le nombre de propositions reçues que le serveur dit en attente (`!isSent` et état `Pending`). Il est recalculé à chaque liste renvoyée par le serveur : `refresh`, l'envoi, et les actions du ticket 05 si elles passent par `publishProposals` comme l'envoi. La nouvelle méthode `refreshPendingReceivedCount` relit `GET api/trade-proposals` sans charger les cartes depuis Scryfall (backlog 13) ; le menu l'appelle à chaque navigation, y compris celle qui reprend la dernière route au chargement de l'application, sauf sur la page de connexion. Aucun nouvel endpoint, aucun changement de contrat. Le compteur s'affiche à côté de l'entrée Proposals et disparaît à 0. Sur la page Proposals, chaque proposition a un bouton « Send a message » qui ouvre la conversation avec l'autre User comme celui de la page Trade (`ChatService.initChat` puis `navigateChat`) ; sans conversation existante, le rappel du chat montre les cartes de la proposition.
  - Expiration (ticket 06) : le compteur ne compte que l'état renvoyé par le serveur. Si le 06 fait renvoyer « Expired » au serveur pour une proposition expirée, elle sort du compteur sans rien changer ici ; un test le vérifie déjà avec cet état. En revanche, une expiration calculée seulement côté client laisserait le compteur faux.
  - Limite connue : tant que le backlog 03 n'est pas corrigé, la page Chat écarte l'historique d'un User qui n'est plus Trade partner. Le lien ouvre alors une conversation vide avec lui.
  - Tests : client 18 nouveaux (181 verts) ; ESLint propre. Deux specs existantes de la barre de navigation et celle de la page Proposals reçoivent un mock des nouveaux services injectés.
  - Fusion avec les tickets 07, 04 et 05, commités avant : sur la page Proposals, le bouton « Send a message » rejoint les actions du 05 dans un même `mat-card-actions`, présent sur chaque proposition, et les imports se cumulent. Les specs de la page écrites par 07 (valeur) et 05 (actions) reçoivent les mocks de `ChatService` et `NavigationService` ; celle du 05 ne compte plus le bouton de chat parmi les actions. Les actions du 05 passent par `publishProposals` : le compteur suit donc une réponse. Après fusion : client 232 verts.
- 2026-10-16 : done in c14fe50 (feat(trade-proposals): count pending proposals and link to the chat).
