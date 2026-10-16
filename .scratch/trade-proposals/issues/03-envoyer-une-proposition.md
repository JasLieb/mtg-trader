# 03: Envoyer une Trade proposal tirée du Trade match et la retrouver dans Proposals

**What to build:** le premier parcours de bout en bout.
- **Formulaire.** Sur la page Trade, chaque Trade partner a un bouton « Proposer un échange », à côté de « Send a message ». Il ouvre un formulaire où toutes les Cards du Trade match sont pré-cochées : celles que je recevrais de sa Doubles list et celles que je donnerais de la mienne.
- **Envoi.** Quand j'envoie, la Trade proposal est enregistrée en attente, avec sa date d'envoi.
- **Page Proposals.** Une nouvelle entrée Proposals, placée sous Trade dans le menu, mène à une page qui liste mes propositions envoyées et reçues, celles en attente d'abord. Pour chacune, on voit l'autre User, les Cards de chaque côté et l'état.
- **Règles côté serveur.** Le serveur fait respecter les règles de création, quel que soit ce qu'envoie le formulaire. Il accepte donc déjà une Card hors du Trade match, à condition qu'elle soit dans la bonne Doubles list ; le formulaire les proposera à partir du ticket 04.

Les cycles de vie et les écrans sont décrits dans `.scratch/trade-proposals/spec.md`.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Scénario 1 de la spec, sans Thoughtseize : Alice envoie Sol Ring contre Ragavan à Bob. La proposition apparaît en attente dans Proposals, chez Alice comme chez Bob.
- [ ] Scénario 3 : si un côté est vide, le formulaire empêche l'envoi et le serveur refuse la proposition.
- [ ] Le serveur refuse un destinataire qui n'est pas Trade partner, ainsi qu'une Card absente de la Doubles list de celui qui la donne. Il accepte une Card hors du Trade match si elle est dans la bonne Doubles list.
- [ ] L'auteur est toujours le User connecté, jamais une valeur fournie par le client.
- [ ] Chaque règle de création est couverte par un test.
