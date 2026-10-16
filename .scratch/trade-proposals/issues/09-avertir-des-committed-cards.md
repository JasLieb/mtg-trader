# 09: Avertir quand une Card est déjà Committed

**What to build:** quand j'engage mes propres Cards, que ce soit en envoyant une proposition ou en en acceptant une, je suis averti si l'une d'elles est déjà une Committed Card. C'est le cas si elle figure dans une autre proposition en attente et non expirée, ou dans un Trade dont je n'ai pas encore fait l'étape de retrait.
- L'avertissement nomme l'autre User concerné.
- Il ne bloque rien.
- L'autre User de la proposition en cours ne le voit pas.
- La proposition que je suis en train d'accepter n'est pas prise en compte.

Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 06, 08

**Status:** done

- [x] Scénario 4 de la spec : Alice est avertie que Sol Ring est déjà engagé avec Bob, et peut envoyer quand même.
- [x] Scénario 9 : Bob est averti, au moment d'accepter, que son Ragavan est déjà engagé, et peut confirmer.
- [x] Aucun avertissement pour une Card d'un Trade dont j'ai fait l'étape de retrait, ni pour une Card d'une proposition refusée, retirée ou expirée.

## Comments

- 2026-10-16 : implémenté, non commité.
  - Serveur : deux lectures, le User venant du JWT. `GET api/trade-proposals/committed-cards` renvoie toutes mes Committed Cards, pour le formulaire. `GET api/trade-proposals/{id}/committed-cards` renvoie celles des Cards que je donne dans cette proposition qui sont déjà engagées ailleurs, la proposition elle-même non comptée ; 404 si elle n'existe pas ou ne me concerne pas. La règle n'existe qu'à un endroit, `TradeProposalHandler.Commits`, bâtie sur `IsPending` et `HasRemovedCards` : une proposition engage les Cards qu'un User y donne tant qu'elle est en attente et non expirée, qu'il l'ait envoyée ou reçue ; acceptée, le Trade les engage tant que ce User n'a pas fait l'étape de retrait. Une proposition refusée, retirée ou expirée n'engage rien. Seul mon côté donnant compte : une Card que je recevrais n'est pas à moi. Chaque Card porte le nom des autres Users avec qui elle est engagée, une fois chacun (dans plusieurs propositions, chacun est nommé). Lecture par `FindUserProposals`, filtrée en mémoire ; `GetProposals` partage désormais la recherche des noms (`UsernamesOf`). Ni l'envoi ni l'acceptation ne changent : l'avertissement ne bloque rien. `TradeProposalResponse`, que voient les deux Users, ne porte rien sur les Committed Cards, si bien que l'autre User ne voit jamais l'avertissement.
  - Flux d'acceptation : une lecture avant d'accepter, puis une confirmation dans l'interface, plutôt qu'une acceptation qui répondrait « confirmation requise » faute d'un drapeau. Trois raisons. L'envoi a de toute façon besoin d'une lecture, puisque l'avertissement s'affiche avant l'envoi et suit les cases ; une même réponse sert donc aux deux. Le contrat d'acceptation du ticket 05 reste intact : pas de corps, pas de statut de plus à côté des 409 et 422. Enfin, un `GET` ne décide rien et ne peut rien bloquer ; l'acceptation qui suit fait ses propres contrôles. Revers : un aller-retour de plus à chaque Accept, et un avertissement qui peut dater de quelques instants, sans conséquence puisqu'il ne bloque rien.
  - Client : modèle `models/committed-cards.ts` (`CommittedCards`, les noms par id de Card, et `committedCardWarnings`, qui ne fait que retenir, parmi les Cards affichées, celles que le serveur déclare engagées). `TradeProposalService.fetchCommittedCards` et `fetchCommittedCardsIn` sont des requêtes ponctuelles qui ne touchent pas à l'état et n'échouent jamais : une erreur vaut « aucune Card engagée ». Composant `app-committed-cards-warning` : « Sol Ring is already committed with Bob. », puis « You can still go ahead if you own more than one copy. ». Formulaire : mes Committed Cards sont lues à l'ouverture, l'avertissement couvre chaque Card cochée de mon côté, dans le Trade match ou non, suit les cases et reste visible à côté des totaux ; Send reste possible. Page Proposals : Accept lit d'abord `{id}/committed-cards`. Sans Card engagée, l'acceptation part aussitôt ; sinon l'avertissement s'affiche sous la proposition avec « Accept anyway » et « Cancel ». Decline reste possible, et l'avertissement disparaît si la proposition n'est plus en attente. Les noms de Cards viennent des Cards déjà chargées par `CardService`, ceux des Users du serveur.
  - Contrat : deux routes nouvelles ; `CommittedCardsResponse` (`committedCards`) et `CommittedCardResponse` (`cardId`, `committedWith`) ↔ interfaces du même nom dans `models/committed-cards.ts`. Aucune réponse existante modifiée ; les specs du formulaire et de la page Proposals reçoivent les nouvelles méthodes du service. Aucune migration : `has-pending-model-changes` ne signale rien.
  - Tests : serveur 27 nouveaux (237 verts) : scénarios 4 et 9, envoi et acceptation qui aboutissent malgré l'avertissement, et chaque cas sans avertissement (Trade dont j'ai fait l'étape, proposition refusée, retirée, expirée à 7 jours pile, proposition en cours d'acceptation, Card que je reçois, Card que je ne donne pas dans cette proposition) ; Trade dont seul l'autre a fait l'étape ; l'autre User n'entend jamais parler de mes Cards. Client 25 nouveaux (288 verts), dont les scénarios 4 et 9 de bout en bout dans le formulaire et sur la page. `dotnet format` et ESLint propres, builds OK.
  - Limite connue : une Card que Scryfall n'a pas pu charger n'est ni listée ni signalée (comportement des tickets 03 et 07).
- 2026-10-16 : done in c213e28 (feat(trade-proposals): warn about cards already committed elsewhere).
