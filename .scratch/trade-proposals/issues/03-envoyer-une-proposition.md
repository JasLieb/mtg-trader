# 03: Envoyer une Trade proposal tirée du Trade match et la retrouver dans Proposals

**What to build:** le premier parcours de bout en bout.
- **Formulaire.** Sur la page Trade, chaque Trade partner a un bouton « Proposer un échange », à côté de « Send a message ». Il ouvre un formulaire où toutes les Cards du Trade match sont pré-cochées : celles que je recevrais de sa Doubles list et celles que je donnerais de la mienne.
- **Envoi.** Quand j'envoie, la Trade proposal est enregistrée en attente, avec sa date d'envoi.
- **Page Proposals.** Une nouvelle entrée Proposals, placée sous Trade dans le menu, mène à une page qui liste mes propositions envoyées et reçues, celles en attente d'abord. Pour chacune, on voit l'autre User, les Cards de chaque côté et l'état.
- **Règles côté serveur.** Le serveur fait respecter les règles de création, quel que soit ce qu'envoie le formulaire. Il accepte donc déjà une Card hors du Trade match, à condition qu'elle soit dans la bonne Doubles list ; le formulaire les proposera à partir du ticket 04.

Les cycles de vie et les écrans sont décrits dans `.scratch/trade-proposals/spec.md`.

**Blocked by:** 02

**Status:** ready-for-agent

- [x] Scénario 1 de la spec, sans Thoughtseize : Alice envoie Sol Ring contre Ragavan à Bob. La proposition apparaît en attente dans Proposals, chez Alice comme chez Bob.
- [x] Scénario 3 : si un côté est vide, le formulaire empêche l'envoi et le serveur refuse la proposition.
- [x] Le serveur refuse un destinataire qui n'est pas Trade partner, ainsi qu'une Card absente de la Doubles list de celui qui la donne. Il accepte une Card hors du Trade match si elle est dans la bonne Doubles list.
- [x] L'auteur est toujours le User connecté, jamais une valeur fournie par le client.
- [x] Chaque règle de création est couverte par un test.

## Comments

- 2026-10-16 : implémenté, non commité.
  - Serveur : entités `TradeProposal` et `TradeProposalCard` (côté de chaque carte : `GivenBy`), migration `AddTradeProposals` (deux tables neuves, aucune donnée existante touchée ; clés étrangères vers `Users` en `Restrict` en attendant le backlog 21). `GET` et `POST api/trade-proposals` ; le `POST` répond avec toutes les propositions du User, comme les mutations de wantlists. Les réponses sont vues du User connecté (`isSent`, cartes données et reçues), car le client ne connaît pas son propre id. Être Trade partners se vérifie via `FindTrades` ; les Doubles lists via la nouvelle méthode de dépôt `GetDoublesList`.
  - Client : bouton « Propose a trade » sur la page Trade, formulaire avec le Trade match pré-coché, page Proposals et entrée de menu. Après l'envoi, on arrive sur Proposals ; en cas de refus, le formulaire reste ouvert avec un message.
  - Tests : serveur 17 nouveaux (118 verts), client 21 nouveaux (163 verts) ; `dotnet format` et ESLint propres. Migration non appliquée : Postgres local arrêté, l'API l'appliquera à son prochain démarrage.
