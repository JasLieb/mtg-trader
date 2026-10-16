# 01: Changer de compte dans le même onglet garde les données et l'identité du compte précédent

**Status:** needs-triage
**Category:** bug
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16), sans reproduction ; à confirmer au triage._

**Constat :** A se déconnecte, puis B se connecte dans le même onglet sans recharger la page. Plusieurs problèmes apparaissent alors :
- B voit les wantlists, les doubles et les partenaires d'échange de A.
- Les modifications de B échouent sans message, car les listes affichées appartiennent à A.
- Le chat reste connecté au nom de A : B voit l'historique de A, et les messages que B envoie partent signés A.

C'est un problème de confidentialité.

**Cause repérée :** les services partagés du client (`WantlistService`, `TradeService`, `ChathubProxy`) chargent leurs données une seule fois, à leur création. Rien ne les réinitialise à la déconnexion, et la connexion au hub de chat n'est jamais fermée.

- [ ] Après une déconnexion, plus aucune donnée du compte précédent n'est affichée ni gardée en mémoire.
- [ ] La connexion au chat est fermée à la déconnexion, puis rouverte avec le jeton du nouveau compte.
- [ ] Un test couvre l'enchaînement « déconnexion, puis connexion avec un autre compte ».

Voir aussi : 07.
