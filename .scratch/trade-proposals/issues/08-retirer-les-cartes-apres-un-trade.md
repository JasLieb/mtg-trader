# 08: Retirer les cartes de mes listes après un Trade

**What to build:** sur un Trade, chaque User a un bouton « Retirer ces cartes de mes listes ». Il ouvre la liste des Cards du Trade, une par une, toutes cochées au départ. À la validation :
- les Cards que je donne, si elles sont cochées, sortent de ma Doubles list ;
- les Cards que je reçois, si elles sont cochées, sortent de toutes mes Wantlists qui les contiennent ;
- l'étape est marquée faite pour moi, même si rien n'était coché, et le bouton disparaît.

L'étape réussit ou échoue en entier. Elle ne touche jamais aux listes de l'autre User. Mes pages Wantlists et Doubles sont à jour sans que j'aie à recharger. Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 05

**Status:** done

- [x] Scénario 10 de la spec : Alice décoche Sol Ring. Thoughtseize sort de sa Doubles list, Ragavan sort de ses Wantlists, Sol Ring reste. Les listes de Bob ne changent pas.
- [x] Valider sans rien cocher marque l'étape comme faite.
- [x] L'étape est refusée si elle a déjà été faite, ou si la proposition n'a pas été acceptée.
- [x] Si une partie du retrait échoue, aucune liste n'est modifiée.

## Comments

- 2026-10-16 : implémenté, non commité.
  - Serveur : `POST api/trade-proposals/{id}/remove-cards`, corps `RemoveTradeCardsRequest` (`givenCards`, `receivedCards` : les Cards cochées de chaque côté, vues du User), logique dans `TradeProposalHandler.RemoveTradeCards`, le User vient du JWT. Les Cards données cochées sortent de sa Doubles list ; les Cards reçues cochées sortent de toutes ses Wantlists qui les contiennent, mais pas de sa Doubles list : ce n'est pas une Wantlist, et recevoir un exemplaire de plus ne retire rien à ses doubles. La Doubles list est reconnue par la règle unique (`DoublesList.IsDoublesList`) parmi les listes de `GetUserWantlists` ; les listes de l'autre User ne sont même pas lues. Réponses : 200 avec `TradeCardsRemovedResponse` ; 404 si la proposition n'existe pas ou ne le concerne pas ; 409 si ce n'est pas un Trade accepté, si l'étape est déjà faite pour lui, ou si une soumission concurrente est passée avant ; 400 si une Card envoyée n'est pas une Card du Trade, du côté où la requête la place. « Ce User a-t-il fait l'étape sur ce Trade ? » se lit avec `TradeProposal.HasRemovedCards(userId)` (pour le ticket 09 et les Committed Cards).
  - Atomicité : une seule méthode de dépôt, `TradeProposalRepository.TryRemoveTradeCards`, prépare toutes les suppressions de `WantlistCards` et la marque, puis appelle `SaveChanges` une seule fois ; EF envoie les `DELETE` et l'`UPDATE` dans une même transaction, annulée en entier si l'un d'eux échoue. Le handler ne fait aucune autre écriture. Pas de transaction explicite ni de nouvelle interface dans Core : c'est le modèle de `UserRepository.CreateWithDoubles`.
  - Concurrence : `ProposerRemovedCardsAt` et `RecipientRemovedCardsAt` sont des jetons de concurrence, comme `State` : l'`UPDATE` porte `WHERE ... IS NULL` sur les deux marques lues. Si une autre soumission de la même étape a écrit avant, ou si une ligne à supprimer a déjà disparu, EF lève `DbUpdateConcurrencyException` : rien n'est écrit, la marque est remise à null et l'étape répond 409. Revers assumé : si Alice et Bob valident leur propre étape au même instant, le second reçoit un 409 et peut recommencer.
  - Migration `AddTradeProposalRemovedCardsAt` : ajoute à `TradeProposals` deux colonnes nullables, `ProposerRemovedCardsAt` et `RecipientRemovedCardsAt` (date de l'étape pour chaque User). Les lignes existantes reçoivent NULL, soit une étape encore à faire pour chacun, ce qui est juste pour un Trade déjà accepté ; aucune donnée touchée. `Down` supprime les deux colonnes. `has-pending-model-changes` propre. Non appliquée : l'API l'appliquera à son prochain démarrage.
  - Client : sur un Trade dont je n'ai pas fait l'étape, la page Proposals affiche « Remove these cards from my lists », qui ouvre `RemoveTradeCardsDialogComponent` : une case par Card, groupées « You give » et « You receive », toutes cochées, et « Remove from my lists », possible même sans rien cocher. `TradeProposalService.removeCards` envoie l'étape. La réponse porte les deux états : les listes vont à `WantlistService.publish` (nouvelle méthode), donc les pages Wantlists et Doubles sont à jour sans recharger, et les propositions sont publiées comme après une action, donc le bouton disparaît. Une seule réponse plutôt qu'un rechargement des propositions ensuite : un seul aller-retour, et aucun moment où le bouton reste affiché après l'étape. Un 409 recharge les propositions et le formulaire reste ouvert avec un message.
  - Contrat : une route nouvelle ; `RemoveTradeCardsRequest` et `TradeCardsRemovedResponse` (`wantlists` et `proposals`, chacun complet), côté client dans `models/trade-cards-removal.ts`, où la réponse est `WantlistsResponse & TradeProposalsResponse`. `TradeProposalResponse.HasRemovedCards` (propriété `init`, pour ne casser aucun `new TradeProposalResponse(...)`) ↔ `TradeProposalMin.hasRemovedCards`, ajouté aux sept specs qui construisent ces objets ; le test du ticket 05 « aucune action sur une proposition acceptée » ignore désormais ce bouton.
  - Tests : serveur 30 nouveaux (191 verts), dont le scénario 10 de bout en bout (handlers et dépôts réels sur un contexte simulé qui applique un `SaveChanges` en entier ou pas du tout), un échec d'écriture qui ne modifie aucune liste, chaque refus, et les jetons de concurrence vérifiés sur le modèle EF ; client 24 nouveaux (256 verts). `dotnet format` et ESLint propres.
  - Fusion avec le ticket 06, commité avant : sans conflit ; le contrôle « pas un Trade » passe par `CurrentState`, donc une proposition expirée est refusée comme les autres. Les deux specs d'expiration du 06 reçoivent `hasRemovedCards: false`. Après fusion : serveur 210 verts, client 263 verts, aucune migration en attente.
- 2026-10-16 : done in afecede (feat(trade-proposals): remove a trade's cards from my lists).
