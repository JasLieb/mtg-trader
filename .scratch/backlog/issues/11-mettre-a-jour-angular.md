# 11: Passer le client sur une version d'Angular encore supportée

**Status:** needs-triage
**Category:** enhancement
**Blocked by:** None (can start immediately)

_Rédigé par IA le 2026-10-16 ; calendrier vérifié le même jour sur angular.dev (page « Releases »)._

**Constat :** le client utilise Angular 19, qui n'est plus supporté. Angular 20 sort du support LTS le 28 novembre 2026, Angular 21 est en LTS jusqu'en juin 2027, et Angular 22 est la version active. La PR Dependabot #1, qui met à jour `vite`, attend depuis avril 2025.

**Pour l'utilisateur :** aucun changement visible ; le client continue de recevoir les correctifs de sécurité.

- [ ] Le client passe à Angular 21 ou 22 (à trancher au triage), une version majeure à la fois avec `ng update`.
- [ ] Le build et les tests passent en CI.
- [ ] La PR Dependabot #1 est fusionnée ou fermée.
