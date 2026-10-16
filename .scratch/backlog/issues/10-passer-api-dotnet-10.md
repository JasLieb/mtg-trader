# 10: Passer l'API sur .NET 10 avant la fin du support de .NET 8

**Status:** needs-triage
**Category:** enhancement
**Blocked by:** None (can start immediately)

_Rédigé par IA le 2026-10-16 ; dates de support vérifiées le même jour sur la page de support .NET de Microsoft._

**Constat :** l'API cible .NET 8, dont le support s'arrête le **10 novembre 2026**. Après cette date, plus aucun correctif de sécurité ne sera publié. .NET 10 est la version LTS actuelle, supportée jusqu'au 14 novembre 2028. Sur le poste de développement, seul .NET 10 est installé, et les tests ne passent qu'en forçant `DOTNET_ROLL_FORWARD=Major`.

**Pour l'utilisateur :** aucun changement visible ; l'API reste maintenue.

- [ ] L'API, l'infrastructure et les tests ciblent .NET 10, avec des paquets NuGet aux versions correspondantes.
- [ ] La CI et les Dockerfiles, y compris les variantes `.render`, utilisent les images .NET 10. Ce sont des fichiers de déploiement : les modifier demande l'accord du mainteneur.
- [ ] Les tests passent sans `DOTNET_ROLL_FORWARD`.
