# 07: Afficher la valeur en euros de chaque côté d'une Trade proposal

**What to build:**
- **Dans le formulaire**, le total en euros de ce que je donne et de ce que je reçois s'affiche et se met à jour à chaque case cochée ou décochée.
- **Sur la page Proposals**, chaque proposition affiche les mêmes totaux.
- **Prix utilisés** : ceux de Scryfall au moment de l'affichage. Ils ne sont jamais envoyés au serveur ni enregistrés.
- **Card sans prix** : elle est signalée dans le total de son côté, et non comptée pour 0 €.
- **Réutilisation** : le calcul des totaux doit pouvoir resservir au ticket backlog 24, pour la page Trade.

Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 03

**Status:** done

- [x] Scénario 11 de la spec : une Card sans prix Scryfall est marquée comme telle dans le total de son côté.
- [x] Dans le formulaire, les totaux suivent les cases cochées.
- [x] Aucune requête vers le serveur ne transporte de prix.

## Comments

- 2026-10-16 : implémenté, non commité.
  - Client : calcul réutilisable `euroTotal(cards): EuroTotal` (`{ euros, unpricedCards }`, somme en centimes) et `formatEuroTotal` dans `features/trade/models/euro-total.ts`, exposés aux templates par le pipe `euroTotal` (`features/trade/pipes/euro-total.pipe.ts`), pour le ticket 24. Le prix retenu est choisi au seul endroit `eurPrice` de `CardService` : `prices.eur` (non foil), car les Cards sont suivies par impression sans indicateur foil ; `eur_foil` seulement pour une impression qui n'existe qu'en foil. `Card.price` devient `number | null` (Scryfall envoie des chaînes, `null` sans prix) ; la carte affiche toujours deux décimales. Une Card sans prix n'est pas comptée : « 45.50 € + 1 card without a price (Brainstorm) ». Formulaire : totaux « You receive » / « You give » entre le contenu et les boutons, recalculés à chaque case à partir des ids cochés ; toute Card passée à `toggleGiven`/`toggleReceived` est retenue, donc les lignes du ticket 04 seront comptées. Page Proposals : « Total : » sous les cartes de chaque côté. Aucun changement serveur.
  - Limite connue : une Card que Scryfall n'a pas pu charger reste absente de la liste et du total (comportement du ticket 03).
  - Tests : client 19 nouveaux (182 verts), dont l'envoi par le vrai `TradeProposalService` dont le corps du `POST` ne contient que le destinataire et les ids ; ESLint propre sur les fichiers modifiés, build de développement OK.
- 2026-10-16 : done in 77c1cfb (feat(trade-proposals): show the euro value of each side of a proposal).
