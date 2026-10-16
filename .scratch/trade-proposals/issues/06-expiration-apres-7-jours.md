# 06: Faire expirer une Trade proposal au bout de 7 jours

**What to build:** une proposition encore en attente 7 jours après son envoi passe à l'état Expirée, pour les deux Users. Elle ne peut plus être acceptée, refusée ni retirée. L'auteur peut en envoyer une nouvelle. Le délai est le même pour toutes les propositions et n'est défini qu'à un seul endroit. La page Proposals et les actions du ticket 05 doivent toujours s'accorder sur le fait qu'une proposition est expirée ou non. Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] Scénario 6 de la spec : après 7 jours sans réponse, la proposition apparaît Expirée chez les deux Users, et son acceptation est refusée.
- [ ] Des tests vérifient la limite, juste avant et juste après 7 jours, avec une horloge contrôlée.
