# 09: Avertir quand une Card est déjà Committed

**What to build:** quand j'engage mes propres Cards, que ce soit en envoyant une proposition ou en en acceptant une, je suis averti si l'une d'elles est déjà une Committed Card. C'est le cas si elle figure dans une autre proposition en attente et non expirée, ou dans un Trade dont je n'ai pas encore fait l'étape de retrait.
- L'avertissement nomme l'autre User concerné.
- Il ne bloque rien.
- L'autre User de la proposition en cours ne le voit pas.
- La proposition que je suis en train d'accepter n'est pas prise en compte.

Spec : `.scratch/trade-proposals/spec.md`.

**Blocked by:** 06, 08

**Status:** ready-for-agent

- [ ] Scénario 4 de la spec : Alice est avertie que Sol Ring est déjà engagé avec Bob, et peut envoyer quand même.
- [ ] Scénario 9 : Bob est averti, au moment d'accepter, que son Ragavan est déjà engagé, et peut confirmer.
- [ ] Aucun avertissement pour une Card d'un Trade dont j'ai fait l'étape de retrait, ni pour une Card d'une proposition refusée, retirée ou expirée.
