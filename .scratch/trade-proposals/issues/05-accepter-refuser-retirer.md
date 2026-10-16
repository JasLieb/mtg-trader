# 05: Accepter, refuser ou retirer une Trade proposal

**What to build:** sur la page Proposals, le destinataire d'une proposition en attente peut l'accepter ou la refuser, et son auteur peut la retirer.
- **Issues définitives.** Une proposition acceptée, refusée ou retirée ne change plus d'état. Une action n'aboutit que si la proposition est encore en attente au moment où elle est enregistrée.
- **Contrôle à l'acceptation.** Chaque Card doit encore figurer dans la Doubles list de celui qui la donne. Sinon, l'acceptation est refusée, le destinataire voit quelles Cards manquent, et la proposition reste en attente.
- **Pas de nouvelle vérification de partenariat.** Il n'est pas nécessaire d'être toujours Trade partners pour accepter.
- **Trade.** Une proposition acceptée s'affiche comme un Trade.

Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Scénario 5 de la spec : une fois la proposition retirée par Alice, Bob ne peut plus l'accepter.
- [ ] Scénario 7 : Sol Ring n'est plus dans la Doubles list d'Alice. L'acceptation de Bob est refusée, et il voit que c'est Sol Ring qui manque.
- [ ] Scénario 8 : Alice et Bob ne sont plus Trade partners, mais Bob peut quand même accepter.
- [ ] Une action faite par le mauvais User, ou sur une proposition qui n'est plus en attente, est refusée.
- [ ] Chaque transition est couverte par un test, y compris les refus.
