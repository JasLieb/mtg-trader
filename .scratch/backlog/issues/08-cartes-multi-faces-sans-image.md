# 08: Les cartes à plusieurs faces s'affichent sans image

**Status:** needs-triage
**Category:** bug
**Blocked by:** None (can start immediately)

_Rédigé par IA d'après une lecture du code (commit `0e587e8`, 2026-10-16), sans reproduction ; à confirmer au triage._

**Constat :** dans les listes et sur la page Trade, les cartes à plusieurs faces (cartes recto-verso, cartes partagées, cartes à aventure…) s'affichent sans image.

**Cause repérée :** dès qu'une carte a plusieurs faces, le client prend l'identifiant d'illustration de la première face comme adresse de l'image, au lieu d'une URL d'image. Selon le type de carte, Scryfall fournit cette URL soit au niveau de la carte, soit pour chaque face.

- [ ] Une carte recto-verso affiche l'image de sa face avant.
- [ ] Une carte partagée ou à aventure affiche son image habituelle.
- [ ] Un test couvre ces deux formes de réponse Scryfall.
