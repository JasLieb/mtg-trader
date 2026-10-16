# MtgTrader

MtgTrader lets Magic: The Gathering players list the cards they are looking for and the doubles they can give away, find the other users they can trade with, and agree on trades with them.

## Language

### Users

**User**:
A person with an account in MtgTrader, who keeps lists of Cards and trades them with other Users.
_Avoid_: player, trader

### Cards

**Card**:
One specific printing of a Magic card, that is, one card in one Set. The same card printed in two Sets is two different Cards, because their prices can differ widely.
_Avoid_: printing, version

**Set**:
A Magic release that Cards are printed in. Choosing another Set for a Card replaces it with a different Card.
_Avoid_: edition, extension, expansion

### Lists

**Wantlist**:
A named list of Cards a User is looking for. A User can keep several.
_Avoid_: want list, collection

**Doubles list**:
The one list of Cards a User owns in spare and is willing to give away. It is not a Wantlist.
_Avoid_: doubles, haves, tradelist

### Trading

**Committed Card**:
A Card from a User's Doubles list that appears in a pending Trade proposal, or in a Trade whose Cards that User has not yet removed from their lists.
_Avoid_: locked, reserved, engaged, tapped

**Trade**:
An exchange of Cards between two Users, agreed when the recipient of a Trade proposal accepts it. The Trade match and the Trade proposal are the stages that lead to it.
_Avoid_: deal, exchange, accepted proposal

**Trade match**:
What two Users' lists say they can trade: the Cards in each one's Doubles list that appear in the other's Wantlists, in both directions.
_Avoid_: match

**Trade partner**:
Two Users are Trade partners when their Trade match holds at least one Card, in either direction. The relation is symmetric.
_Avoid_: trader, contact

**Trade proposal**:
An offer from one User to a Trade partner to swap chosen Cards from the proposer's Doubles list for chosen Cards from the recipient's Doubles list, with at least one Card on each side. It can include Cards outside the Trade match, so that the value of the two sides can be balanced. It stays pending until the recipient accepts or declines it, the proposer withdraws it, or it expires; each of those outcomes is final.
_Avoid_: offer
