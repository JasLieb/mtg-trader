# 02: Rendre les Trade partners symétriques

**What to build:** deux Users deviennent Trade partners dès que leur Trade match contient au moins une Card, dans un sens ou dans l'autre. La page Trade montre donc aussi les Users qui cherchent une Card de ma Doubles list sans rien avoir de ce que je cherche. Elle les présente correctement quand ils n'ont rien à me donner. La page Chat, qui part des Trade partners, les inclut aussi. La règle doit être réutilisable telle quelle, car l'envoi d'une proposition la vérifie lui aussi (ticket 03). Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [x] Scénario 2 de la spec : Carol cherche le Sol Ring d'Alice, et Alice ne cherche rien de ce qu'a Carol. Chacune voit l'autre sur sa page Trade.
- [x] Un User qui n'a aucune Card en commun avec moi, dans aucun sens, n'apparaît pas.
- [x] La réponse de la page Trade garde sa forme. Seul le côté « ce qu'il peut me donner » peut désormais être vide.
- [x] Des tests couvrent chacun des deux sens, ainsi que l'absence de correspondance.

## Comments

- 2026-10-16 : implémenté, non commité.
  - Serveur : `FindTrades` ajoute aux Users dont les doubles contiennent ce que je cherche ceux qui cherchent mes doubles (nouvelle méthode de dépôt `FindUserIdsWantingCards`). Un même partenaire n'apparaît qu'une fois. Pour le ticket 03, « être Trade partners » = figurer dans `FindTrades` de l'auteur.
  - Client : un côté vide de la correspondance affiche « none of X's doubles » ou « none of your doubles » au lieu d'une liste vide.
  - Tests : `TradeHandlerTradePartnersTests` (6), `WantlistRepositoryUsersWantingCardsTests` (6), `trade-home.component.partners.spec.ts` (3). Serveur 101 tests verts, client 142 ; `dotnet format` et ESLint propres.
