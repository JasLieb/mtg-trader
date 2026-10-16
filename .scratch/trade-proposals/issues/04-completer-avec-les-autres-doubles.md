# 04: Compléter une proposition avec les autres doubles des deux Users

**What to build:** sous les Cards du Trade match, le formulaire liste aussi les autres Cards de ma Doubles list et de celle du partenaire, toutes décochées, pour que je puisse équilibrer la valeur de l'échange. Pour la première fois, l'application montre la Doubles list complète d'un autre User. Seuls ses Trade partners peuvent la voir, et ses Wantlists restent privées. Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 03

**Status:** done

- [x] Scénario 1 de la spec en entier : Alice ajoute son Thoughtseize, qui est hors du Trade match, et l'envoi aboutit.
- [x] La Doubles list d'un User qui n'est pas Trade partner ne peut pas être lue.
- [x] Une Card du Trade match n'apparaît qu'une fois dans le formulaire.

## Comments

- 2026-10-16 : implémenté, non commité.
  - Serveur : `GET api/trade-proposals/partners/{partnerId}/doubles` renvoie la Doubles list entière d'un Trade partner, en ids de cartes Scryfall seulement (nouveau record `PartnerDoublesResponse`, nouvelle méthode `TradeProposalHandler.GetPartnerDoubles`). Le partenariat se vérifie par la même règle que l'envoi (`AreTradePartners`, via `FindTrades`) et la liste se lit par `GetDoublesList` : les Wantlists du partenaire ne sont jamais lues. À un User qui n'est pas Trade partner, le serveur répond 404 « Doubles list not found », sans révéler si la liste existe. Aucune migration, aucun changement des contrats existants.
  - Client : interface `PartnerDoublesResponse` (`models/partner-doubles-response.ts`) et méthode `TradeProposalService.fetchPartnerDoubles`, requête ponctuelle qui ne touche pas à l'état des propositions ; un refus du serveur donne une liste vide. Dans le formulaire, chaque côté liste le Trade match en tête, pré-coché, puis les autres Cards de la Doubles list concernée, décochées : la mienne vient de `WantlistService.doubles$`, celle du partenaire du nouvel endpoint. Une Card du Trade match n'apparaît qu'une fois. Un Trade partner qui n'a rien à me donner dans le Trade match peut désormais recevoir une proposition, puisque ses autres doubles sont proposés.
  - Tests : serveur 6 nouveaux (124 verts), client 12 nouveaux (175 verts) ; `dotnet format` et ESLint propres. Côté serveur, l'envoi avec Thoughtseize était déjà couvert par le ticket 03. Le compteur de Bob du scénario 1 relève du ticket 10.
  - Fusion avec le ticket 07, commité avant : les totaux en euros se calculent désormais sur les listes du formulaire (`receivedCards()` / `givenCards()`) filtrées par les cases cochées, et la table `offeredCards` que 07 remplissait à chaque case disparaît. La spec de valeur de 07 fournit la Doubles list d'Alice et répond à la requête des doubles du partenaire ; Thoughtseize s'y coche par sa case. Après fusion : serveur 124 verts, client 194 verts.
- 2026-10-16 : done in 4ecc0d0 (feat(trade-proposals): offer all doubles of both users in a proposal).
