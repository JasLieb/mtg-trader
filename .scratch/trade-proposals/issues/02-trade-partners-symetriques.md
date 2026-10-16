# 02: Rendre les Trade partners symétriques

**What to build:** deux Users deviennent Trade partners dès que leur Trade match contient au moins une Card, dans un sens ou dans l'autre. La page Trade montre donc aussi les Users qui cherchent une Card de ma Doubles list sans rien avoir de ce que je cherche. Elle les présente correctement quand ils n'ont rien à me donner. La page Chat, qui part des Trade partners, les inclut aussi. La règle doit être réutilisable telle quelle, car l'envoi d'une proposition la vérifie lui aussi (ticket 03). Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Scénario 2 de la spec : Carol cherche le Sol Ring d'Alice, et Alice ne cherche rien de ce qu'a Carol. Chacune voit l'autre sur sa page Trade.
- [ ] Un User qui n'a aucune Card en commun avec moi, dans aucun sens, n'apparaît pas.
- [ ] La réponse de la page Trade garde sa forme. Seul le côté « ce qu'il peut me donner » peut désormais être vide.
- [ ] Des tests couvrent chacun des deux sens, ainsi que l'absence de correspondance.
