# 03: Les messages d'un joueur qui n'est pas mon partenaire d'échange sont invisibles

**Status:** needs-triage
**Category:** bug
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16), sans reproduction ; à confirmer au triage._

**Constat :** la page Chat n'affiche que les conversations avec des joueurs présents dans ma liste d'échanges. Or cette liste n'est pas symétrique :
- A voit B si B a en double une carte que A cherche.
- B ne voit A que si A a en double une carte que B cherche.

Quand A écrit à B sans que A soit dans la liste de B, le message est bien enregistré, mais B ne le voit jamais. Une conversation disparaît aussi dès que l'autre joueur n'est plus un partenaire d'échange, par exemple après la modification d'une liste.

**Cause repérée :** le client va chercher le nom et les cartes de chaque correspondant dans la liste des partenaires d'échange, et écarte les conversations dont le correspondant n'y figure pas. L'historique envoyé par le serveur ne contient que l'identifiant du correspondant, pas son nom.

- [ ] Toute conversation enregistrée s'affiche, que l'autre joueur soit ou non un partenaire d'échange actuel.
- [ ] Le nom du correspondant s'affiche dans tous les cas. Le rappel des cartes à échanger n'apparaît que s'il y en a.

Voir aussi : 04, 14.

## Comments

- 2026-10-16 (grilling du 26, `.scratch/trade-proposals/spec.md`) : le 26 rend les Trade partners symétriques (Trade match non vide dans un sens ou dans l'autre), ce qui règle le premier cas. Le second reste : une conversation disparaît quand les deux Users ne sont plus partenaires, et le lien d'une Trade proposal vers la conversation y mène alors à une page vide.
