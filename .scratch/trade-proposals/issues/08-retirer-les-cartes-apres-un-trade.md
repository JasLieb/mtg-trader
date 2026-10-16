# 08: Retirer les cartes de mes listes après un Trade

**What to build:** sur un Trade, chaque User a un bouton « Retirer ces cartes de mes listes ». Il ouvre la liste des Cards du Trade, une par une, toutes cochées au départ. À la validation :
- les Cards que je donne, si elles sont cochées, sortent de ma Doubles list ;
- les Cards que je reçois, si elles sont cochées, sortent de toutes mes Wantlists qui les contiennent ;
- l'étape est marquée faite pour moi, même si rien n'était coché, et le bouton disparaît.

L'étape réussit ou échoue en entier. Elle ne touche jamais aux listes de l'autre User. Mes pages Wantlists et Doubles sont à jour sans que j'aie à recharger. Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] Scénario 10 de la spec : Alice décoche Sol Ring. Thoughtseize sort de sa Doubles list, Ragavan sort de ses Wantlists, Sol Ring reste. Les listes de Bob ne changent pas.
- [ ] Valider sans rien cocher marque l'étape comme faite.
- [ ] L'étape est refusée si elle a déjà été faite, ou si la proposition n'a pas été acceptée.
- [ ] Si une partie du retrait échoue, aucune liste n'est modifiée.
