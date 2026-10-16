# 06: Faire expirer une Trade proposal au bout de 7 jours

**What to build:** une proposition encore en attente 7 jours après son envoi passe à l'état Expirée, pour les deux Users. Elle ne peut plus être acceptée, refusée ni retirée. L'auteur peut en envoyer une nouvelle. Le délai est le même pour toutes les propositions et n'est défini qu'à un seul endroit. La page Proposals et les actions du ticket 05 doivent toujours s'accorder sur le fait qu'une proposition est expirée ou non. Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 05

**Status:** done

- [x] Scénario 6 de la spec : après 7 jours sans réponse, la proposition apparaît Expirée chez les deux Users, et son acceptation est refusée.
- [x] Des tests vérifient la limite, juste avant et juste après 7 jours, avec une horloge contrôlée.

## Comments

- 2026-10-16 : implémenté, non commité.
  - Serveur : l'expiration se déduit à la lecture, elle n'est jamais enregistrée. Le délai n'existe qu'à un endroit, `TradeProposalHandler.ExpiryDelay` (7 jours), et la règle reste celle du ticket 05, `CurrentState` : une proposition encore `Pending` en base est `Expired` dès l'instant `SentAt + 7 jours`, cet instant compris (`now >= SentAt + 7 jours`, horloge `IDateTimeService`). `IsPending` (en attente et non expirée) en découle : la page (état affiché, et l'expirée quitte le bloc des propositions en attente pour l'historique), le compteur et les actions s'accordent donc d'eux-mêmes. Accepter, refuser ou retirer une proposition expirée répond 409, comme pour toute proposition qui n'est plus en attente, et l'état enregistré reste `Pending`. Le `GET` et chaque mutation réussie renvoient « Expired » (elles répondent toutes par `GetProposals`) ; après un 409, le client recharge la liste. Une proposition acceptée, refusée ou retirée garde son état, même envoyée il y a plus de 7 jours. Rien ne bloque l'envoi d'une nouvelle proposition. L'écriture conditionnelle du 05 (`WHERE "State" = 'Pending'`) ne regarde pas l'expiration : la vérification du handler avant d'écrire suffit, puisque `SentAt` ne change jamais. Nouvelle valeur `Expired` de l'enum `TradeProposalState`, jamais écrite ; `dotnet ef migrations has-pending-model-changes` confirme qu'il n'y a aucune migration à générer (l'état est stocké en texte).
  - Client : `TradeProposalState` accepte `'Expired'`. La page Proposals l'affiche comme les autres états définitifs : ni Accept, ni Decline, ni Withdraw, mais toujours « Send a message ». Le client ne calcule jamais l'expiration à partir de `sentAt` (affiché seulement) : la page et le compteur du menu suivent l'état renvoyé par le serveur. La spec du compteur du ticket 10 n'a plus besoin de transtypage pour `'Expired'`.
  - Tests : serveur 19 nouveaux (180 verts) avec une horloge substituée : un tick avant les 7 jours, à 7 jours pile et un tick après, pour l'affichage chez les deux Users et pour chacune des trois actions ; scénario 6 ; état enregistré inchangé ; états définitifs conservés ; tri ; nouvel envoi permis. Client 7 nouveaux (239 verts), dont le scénario 6 de bout en bout (acceptation refusée en 409, rechargement, proposition affichée Expirée et retirée du compteur) et une proposition ancienne que le serveur dit encore en attente, comptée et actionnable. `dotnet format` et ESLint propres, builds OK. Aucune migration. Contrat : aucune route nouvelle ; `TradeProposalResponse.State` peut valoir « Expired », et son pendant TypeScript l'accepte.
- 2026-10-16 : done in 14901e4 (feat(trade-proposals): expire a proposal left unanswered for 7 days).
