# Spec : Trade proposals (ticket 26)

_Issue de la session de grilling du 2026-10-16 sur le ticket `.scratch/backlog/issues/26-proposer-un-echange.md`. Le vocabulaire en gras est défini dans `GLOSSARY.md` ; la décision de suivre les Cards par impression est dans `docs/adr/0001-cards-are-tracked-by-printing.md`._

## Problème

Aujourd'hui, un échange se négocie uniquement par chat et rien ne garde la trace de ce qui a été convenu. Les Users veulent pouvoir proposer un échange précis, équilibrer la valeur des deux côtés, le faire accepter, puis mettre leurs listes à jour en conséquence.

## Parcours

1. Sur la page Trade, Alice ouvre le formulaire « Proposer un échange » sur la carte de son **Trade partner** Bob.
2. Elle compose une **Trade proposal** : des Cards de sa **Doubles list** qu'elle donne, des Cards de la Doubles list de Bob qu'elle reçoit. Les totaux en euros de chaque côté l'aident à équilibrer.
3. Elle l'envoie. La proposition est en attente.
4. Bob voit un compteur sur l'entrée **Proposals** du menu, ouvre la proposition et l'accepte ou la refuse. Tant qu'il n'a pas répondu, Alice peut la retirer ; sans réponse, elle expire au bout de 7 jours.
5. Acceptée, la proposition devient un **Trade**. Alice et Bob s'envoient les cartes hors de l'application.
6. Chacun passe ensuite, une fois, par l'étape « Retirer ces cartes de mes listes ».

## Règles

### Envoyer une proposition

- On ne propose qu'à un **Trade partner**. La relation devient symétrique : deux Users sont partenaires quand leur **Trade match** contient au moins une Card, dans un sens ou dans l'autre. Aujourd'hui la page Trade ne montre que les Users dont les doubles contiennent une Card de mes Wantlists ; elle doit aussi montrer ceux dont les Wantlists contiennent une Card de mes doubles.
- Une proposition contient des Cards de la Doubles list de l'auteur (données) et des Cards de la Doubles list du destinataire (reçues), **au moins une de chaque côté**. Aucune Card hors de ces deux Doubles lists.
- Elle peut sortir du Trade match : c'est ce qui permet d'équilibrer la valeur.
- Chaque Card compte pour un exemplaire. Les quantités arrivent avec le ticket 22.
- Une proposition ne se modifie pas après envoi. Pour changer les cartes, le destinataire refuse et envoie sa propre proposition ; la symétrie des Trade partners garantit qu'il le peut.
- Plusieurs propositions en attente entre les deux mêmes Users sont permises, sans limite.

### Cycle de vie

| État | Atteint quand | Par qui |
|---|---|---|
| En attente | la proposition est envoyée | l'auteur |
| Acceptée | le destinataire l'accepte (elle devient un Trade) | le destinataire |
| Refusée | le destinataire la refuse | le destinataire |
| Retirée | l'auteur la retire tant qu'elle est en attente | l'auteur |
| Expirée | 7 jours se sont écoulés depuis l'envoi sans réponse | personne |

- Acceptée, Refusée, Retirée et Expirée sont définitives. Pas d'annulation d'un Trade : un souci après acceptation relève du futur ticket d'assistance (27).
- Le délai de 7 jours est le même pour toutes les propositions ; l'auteur ne le choisit pas.
- Une proposition expirée se traite comme une proposition refusée : l'auteur peut en envoyer une nouvelle.
- Être Trade partners n'est exigé qu'à l'envoi. Si l'un des deux modifie ses listes et qu'ils ne sont plus partenaires, la proposition reste visible et acceptable.

### Accepter une proposition

- L'acceptation est refusée si une Card de la proposition ne figure plus dans la Doubles list de celui qui la donne, de l'un ou l'autre côté. Le destinataire voit quelles Cards manquent ; la proposition reste en attente, et il peut la refuser ou l'auteur la retirer.
- Une proposition expirée ou qui n'est plus en attente ne peut pas être acceptée.

### Committed Cards

Une Card est engagée (**Committed Card**) lorsqu'elle figure dans une proposition en attente ou dans un Trade dont son propriétaire n'a pas encore passé l'étape de retrait.

- Engager une Card déjà engagée est permis : sans quantités, l'application ne sait pas si le User en possède plusieurs exemplaires.
- Le User qui engage ses propres Cards est averti, sans être bloqué, si l'une d'elles est déjà engagée : l'auteur à l'envoi, le destinataire à l'acceptation. L'avertissement indique avec qui elle est engagée. L'autre User ne voit pas cet avertissement.
- Le verrou des exemplaires engagés (disponible = exemplaires en double − exemplaires engagés) est reporté au ticket 22.

### Retirer les cartes après un Trade

- Sur un Trade, chaque User dispose d'une étape « Retirer ces cartes de mes listes », qui ne touche qu'à ses propres listes.
- Elle liste les Cards du Trade une par une, toutes cochées par défaut :
  - les Cards que je donne sortent de ma Doubles list ;
  - les Cards que je reçois sortent de **toutes** mes Wantlists qui les contiennent.
- Décocher sert quand il me reste des exemplaires en double, ou quand j'en cherche encore (un playset, par exemple).
- L'étape se fait une seule fois par User et par Trade. Valider, même sans rien cocher, la marque comme faite et le bouton disparaît. Le ticket 22 se servira de cette marque pour libérer les exemplaires engagés.
- Il n'y a pas de retrait automatique à l'acceptation : sans quantités, il retirerait souvent une Card encore cherchée ou encore en double.

### Valeur

- Le formulaire et la proposition affichent le total en euros de chaque côté, calculé à partir des prix Scryfall du moment.
- Aucun prix n'est enregistré avec la proposition : Scryfall reste la seule source des données de carte. Les deux Users peuvent donc voir des totaux légèrement différents selon le moment.
- Une Card sans prix est signalée, pas comptée pour 0 €.

## Écrans

- **Page Trade** : chaque Trade partner a un bouton « Proposer un échange » à côté de « Send a message ». Un partenaire peut désormais n'avoir rien à me donner dans le Trade match ; la page doit l'afficher correctement.
- **Formulaire de proposition** : les Cards du Trade match sont pré-cochées des deux côtés ; les autres Cards des deux Doubles lists sont listées en dessous, décochées. Les totaux se mettent à jour à chaque case. L'avertissement des Cards déjà engagées s'affiche avant l'envoi. C'est la première fois que l'application montre toute la Doubles list d'un autre User ; ses Wantlists restent privées.
- **Page Proposals** (nouvelle entrée du menu, route `proposals`) : propositions reçues et envoyées, en attente d'abord, puis l'historique, conservé sans limite. Chaque proposition montre l'autre User, les Cards des deux côtés, les totaux, son état, les actions possibles (accepter, refuser, retirer, retirer les cartes de mes listes) et un lien vers la conversation avec l'autre User.
- **Menu** : l'entrée Proposals affiche le nombre de propositions reçues en attente. Pas de temps réel : le compteur et la liste sont rechargés au chargement de l'application et à la navigation.

## Scénarios d'acceptation

Chaque scénario part de ces listes et, à partir du scénario 4, de la proposition qu'Alice a envoyée à Bob au scénario 1 :

| | Wantlists | Doubles list |
|---|---|---|
| Alice | Ragavan (MH2), Lightning Bolt (M10) | Sol Ring (C21), Counterspell (MH2), Thoughtseize (THS) |
| Bob | Sol Ring (C21) | Ragavan (MH2), Brainstorm (EMA) |
| Carol | Sol Ring (C21) | Brainstorm (EMA) |

1. Alice ouvre le formulaire pour Bob : Ragavan (reçu) et Sol Ring (donné) sont pré-cochés. Elle coche en plus Thoughtseize et envoie : la proposition est en attente chez Alice et chez Bob, et le compteur de Bob passe à 1.
2. Alice ne cherche rien de ce qu'a Carol, mais Carol cherche le Sol Ring d'Alice : elles sont Trade partners, et chacune voit l'autre sur sa page Trade.
3. Alice décoche Ragavan et ne garde que des Cards données : l'envoi est impossible.
4. Alice propose Sol Ring à Carol contre Brainstorm : elle est avertie que Sol Ring est engagé avec Bob, et peut envoyer quand même.
5. Alice retire sa proposition à Bob : elle passe à Retirée pour les deux, et Bob ne peut plus l'accepter.
6. Une proposition sans réponse depuis 7 jours apparaît Expirée et ne peut plus être acceptée.
7. Alice retire Sol Ring de sa Doubles list, puis Bob accepte : l'acceptation est refusée, Bob voit que Sol Ring manque, la proposition reste en attente.
8. Après l'envoi, Bob retire Sol Ring de sa Wantlist et Alice retire Ragavan de la sienne : ils ne sont plus partenaires, mais Bob peut toujours accepter, puisque les Cards sont toujours dans les deux Doubles lists.
9. Bob accepte alors que son Ragavan est engagé dans une autre de ses propositions : il est averti et peut confirmer. La proposition devient un Trade.
10. Alice passe l'étape de retrait en décochant Sol Ring : Thoughtseize sort de sa Doubles list, Ragavan sort de ses Wantlists, Sol Ring reste. Le bouton disparaît pour elle ; les listes de Bob ne changent pas.
11. Une Card sans prix Scryfall est marquée comme telle dans le total de son côté.

## Notes d'implémentation

_Suggestions pour le découpage en tickets, non tranchées pendant la session._

- **Modèle** : une entité de proposition (auteur, destinataire, date d'envoi, état, date de réponse, et pour chaque User la date de passage de l'étape de retrait) et ses lignes (Card, côté). Nouvelle migration (skill `mtg-schema-change`). L'état Expirée peut se déduire à la lecture (en attente et envoi + 7 jours dépassé, via `IDateTimeService`) plutôt que par une tâche planifiée ; l'acceptation doit alors vérifier l'expiration elle aussi.
- **Logique** dans un handler de `MtgTrader.Core`, contrôleur mince qui prend l'utilisateur du JWT : seul le destinataire accepte ou refuse, seul l'auteur retire, et chaque transition exige l'état En attente au moment de l'écriture.
- **Atomicité** : chaque écriture de `BaseRepository` sauvegarde aussitôt (`.claude/rules/data-access.md`). L'étape de retrait touche plusieurs listes plus la marque « fait » ; décider explicitement comment la rendre atomique.
- **Contrats** : chaque record de requête/réponse a son interface TypeScript écrite à la main (`.claude/rules/api-contracts.md`). L'étape de retrait modifie des listes : sa réponse doit renvoyer le `WantlistsResponse` complet pour que `WantlistService` se mette à jour.
- **`FindTrades`** devient symétrique ; `UserTradeResponse.Doubles` peut alors être vide.
- **Doubles list d'un partenaire** : le formulaire a besoin d'un accès en lecture à la Doubles list complète d'un Trade partner, et seulement à elle. Reconnaître la Doubles list par le suffixe `_doubles` (`.claude/rules/wantlists.md`, ticket 19).
- **Client** : un service racine pour les propositions, sur le modèle des autres (`BehaviorSubject` privé, `name$` en lecture) ; les prix passent par `CardService`.

## Hors périmètre

- Quantités, verrou des exemplaires engagés, retrait automatique : ticket 22.
- Notification en temps réel des propositions : tickets 16 et 25.
- Assistance en cas de souci sur un Trade : ticket 27.
- Sort des propositions et Trades d'un compte supprimé : ticket 21.
- Totaux et tri par valeur sur la page Trade : ticket 24, qui partage le calcul des totaux avec le formulaire.
- Contre-proposition modifiable, annulation d'un Trade, correspondance « toutes impressions » (écartée par l'ADR 0001).

## Dépendances

- Le lien d'une proposition vers la conversation ne mène à une conversation visible que si les deux Users sont Trade partners, tant que le ticket 03 n'est pas corrigé : la page Chat écarte les conversations avec les autres Users.

## Tickets

Dans `issues/` :

| # | Ticket | Bloqué par |
|---|---|---|
| 01 | Une seule règle pour reconnaître la Doubles list (préparation, reprend le backlog 19) | — |
| 02 | Rendre les Trade partners symétriques | 01 |
| 03 | Envoyer une Trade proposal tirée du Trade match et la retrouver dans Proposals | 02 |
| 04 | Compléter une proposition avec les autres doubles des deux Users | 03 |
| 05 | Accepter, refuser ou retirer une Trade proposal | 03 |
| 06 | Faire expirer une Trade proposal au bout de 7 jours | 05 |
| 07 | Afficher la valeur en euros de chaque côté | 03 |
| 08 | Retirer les cartes de mes listes après un Trade | 05 |
| 09 | Avertir quand une Card est déjà Committed | 06, 08 |
| 10 | Compteur des propositions reçues et lien vers la conversation | 03 |
