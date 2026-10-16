# Inventaire de l'existant

Établi le 2026-10-16 à partir du code de la branche `chore/init-claude` (commit `0e587e8`). Chaque ligne décrit ce que l'utilisateur peut déjà faire.

## Compte et session

1. Créer un compte avec un e-mail et un mot de passe. Si l'e-mail est déjà pris, un message d'erreur s'affiche, et la liste de doubles est créée automatiquement.
2. Se connecter. Les majuscules et les espaces autour de l'e-mail ne comptent pas, et les mots de passe sont hachés.
3. Rester connecté d'une visite à l'autre : la session est conservée dans le navigateur, et l'application rouvre la dernière page consultée.
4. Se déconnecter depuis le menu.

## Collection

5. Créer des wantlists nommées et les supprimer.
6. Chercher une carte par son nom, avec des suggestions venant de Scryfall, et l'ajouter à une liste.
7. Voir les cartes d'une liste avec leur image, le symbole de l'édition et le prix en euros.
8. Changer l'édition d'une carte, ou la retirer de la liste.
9. Gérer sa liste de doubles sur une page à part, avec les mêmes outils. Cette liste ne peut pas être supprimée.

## Échanges

10. Voir les joueurs qui ont en double au moins une carte que je cherche. Pour chacun s'affichent ses doubles que je cherche et, s'il y en a, mes doubles qu'il cherche.
11. Contacter l'un de ces joueurs avec le bouton « Send a message ».

## Chat

12. Discuter en temps réel avec un joueur. Les messages sont enregistrés et l'historique revient à chaque connexion.
13. Retrouver ses conversations sur la page Chat, avec en tête de chacune un rappel des cartes à échanger. Les messages vides ou de plus de 1 000 caractères sont refusés.

## Interface

14. Un menu latéral donne accès aux pages Wantlists, Doubles, Trade et Chat. Sur un écran de moins de 480 px, le menu se replie.

## Plateforme (invisible pour l'utilisateur)

15. Déploiement avec Docker Compose en local, et sur Render (API, client et PostgreSQL) avec déploiement automatique.
16. La CI GitHub Actions compile et teste le serveur et le client à chaque push.

## Limites repérées dans le code

Ces points sont utiles pour décider de la suite. Ce ne sont pas encore des tickets ; chacun pourra devenir une issue `needs-triage` sous `.scratch/`.

- Un joueur est affiché sous son e-mail, car il n'existe pas de pseudo.
- Une wantlist ne peut pas être renommée.
- Les cartes recto-verso s'affichent sans image : le client passe un identifiant d'illustration là où il faudrait une URL.
- La liste des échanges est chargée une seule fois par session. Après l'ajout d'une carte, il faut recharger la page pour la voir à jour.
- Une conversation disparaît de la page Chat si l'autre joueur n'est plus un partenaire d'échange.
- Les messages n'indiquent pas qui les a écrits, seulement la date et le texte.
- Un seul onglet ouvert par utilisateur reçoit les messages en direct.
- On ne peut pas réinitialiser un mot de passe oublié, et le format de l'e-mail n'est pas vérifié à l'inscription.
