# 10: Compteur des propositions reçues et lien vers la conversation

**What to build:**
- **Compteur.** L'entrée Proposals du menu affiche le nombre de propositions que j'ai reçues et qui sont en attente. Il se met à jour au chargement de l'application et à chaque navigation. Il n'y a pas de temps réel ; c'est le sujet des tickets backlog 16 et 25.
- **Lien vers la conversation.** Sur la page Proposals, chaque proposition mène à la conversation avec l'autre User.
- **Limite connue.** Tant que le ticket backlog 03 n'est pas corrigé, la page Chat n'affiche pas la conversation avec un User qui n'est plus Trade partner.

Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Scénario 1 de la spec : après l'envoi, le compteur de Bob passe à 1. Il revient à 0 une fois que Bob a répondu.
- [ ] Une fois le ticket 06 livré, les propositions expirées ne sont plus comptées.
- [ ] Le lien ouvre la conversation avec l'autre User, à condition que les deux soient Trade partners.
