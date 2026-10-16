# 05: Accepter, refuser ou retirer une Trade proposal

**What to build:** sur la page Proposals, le destinataire d'une proposition en attente peut l'accepter ou la refuser, et son auteur peut la retirer.
- **Issues définitives.** Une proposition acceptée, refusée ou retirée ne change plus d'état. Une action n'aboutit que si la proposition est encore en attente au moment où elle est enregistrée.
- **Contrôle à l'acceptation.** Chaque Card doit encore figurer dans la Doubles list de celui qui la donne. Sinon, l'acceptation est refusée, le destinataire voit quelles Cards manquent, et la proposition reste en attente.
- **Pas de nouvelle vérification de partenariat.** Il n'est pas nécessaire d'être toujours Trade partners pour accepter.
- **Trade.** Une proposition acceptée s'affiche comme un Trade.

Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 03

**Status:** done

- [x] Scénario 5 de la spec : une fois la proposition retirée par Alice, Bob ne peut plus l'accepter.
- [x] Scénario 7 : Sol Ring n'est plus dans la Doubles list d'Alice. L'acceptation de Bob est refusée, et il voit que c'est Sol Ring qui manque.
- [x] Scénario 8 : Alice et Bob ne sont plus Trade partners, mais Bob peut quand même accepter.
- [x] Une action faite par le mauvais User, ou sur une proposition qui n'est plus en attente, est refusée.
- [x] Chaque transition est couverte par un test, y compris les refus.

## Comments

- 2026-10-16 : implémenté, non commité.
  - Serveur : `POST api/trade-proposals/{id}/accept`, `/decline` et `/withdraw`, logique dans `TradeProposalHandler` (`AcceptProposal`, `DeclineProposal`, `WithdrawProposal`). Seul le destinataire accepte ou refuse, seul l'auteur retire, le User vient du JWT. Réponses : 200 avec toutes les propositions du User, comme le `POST` ; 404 si la proposition n'existe pas ou ne le concerne pas ; 403 si ce n'est pas à lui d'agir ; 409 si elle n'est plus en attente ; 422 avec `MissingCardsResponse` (`missingCards`) si des Cards, d'un côté ou de l'autre, ne sont plus dans la Doubles list de celui qui les donne, et la proposition reste en attente. Pas de nouvelle vérification de partenariat. La règle « en attente » n'existe qu'à un endroit, `TradeProposalHandler.CurrentState` et `IsPending`, utilisés par la page (état affiché et tri) comme par les actions ; le ticket 06 y ajoutera l'expiration. Écriture conditionnelle : `State` est un jeton de concurrence EF, donc l'`UPDATE` porte `WHERE "State" = 'Pending'` ; si une autre action est passée avant, `TradeProposalRepository.TryRespond` renvoie false et l'action est refusée en 409.
  - Migration `AddTradeProposalRespondedAt` : ajoute la colonne nullable `TradeProposals.RespondedAt` (date d'acceptation, de refus ou de retrait). Les lignes existantes, toutes en attente, reçoivent NULL ; aucune donnée touchée. Le jeton de concurrence ne modifie que le snapshot. Non appliquée : l'API l'appliquera à son prochain démarrage.
  - Client : `TradeProposalService.accept`, `decline` et `withdraw` publient les propositions renvoyées ; un refus échoue avec un `TradeProposalRefusal` (Cards manquantes ; plus en attente, et la liste est alors rechargée ; autre échec). Page Proposals : seuls les boutons permis (Accept et Decline sur une proposition reçue en attente, Withdraw sur une proposition envoyée en attente), une action à la fois, un message de refus sous la proposition avec le nom des Cards manquantes. Une proposition acceptée s'affiche « Trade with … ».
  - Tests : serveur 37 nouveaux (155 verts), dont chaque transition, chaque refus et le jeton de concurrence vérifié sur le modèle EF ; client 20 nouveaux (183 verts). `dotnet format` et ESLint propres. Contrat : trois routes nouvelles, `MissingCardsResponse` côté serveur et son interface dans `models/trade-proposal-action.ts` ; `TradeProposalResponse` inchangé.
  - Fusion avec les tickets 07 et 04, commités avant : conflits d'ajout seulement (membres voisins dans le handler, son interface, le contrôleur, et les imports de la page Proposals), résolus en gardant les deux. Après fusion : serveur 161 verts, client 214 verts.
- 2026-10-16 : done in 67baad7 (feat(trade-proposals): accept, decline or withdraw a trade proposal).
