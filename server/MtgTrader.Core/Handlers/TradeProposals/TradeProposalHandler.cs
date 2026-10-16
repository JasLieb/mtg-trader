using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Handlers.Trade;
using MtgTrader.Core.Repositories;
using MtgTrader.Core.Services;

namespace MtgTrader.Core.Handlers.TradeProposals;

public class TradeProposalHandler(
    ITradeProposalRepository tradeProposalRepository,
    IWantlistRepository wantlistRepository,
    IUserRepository userRepository,
    ITradeHandler tradeHandler,
    IDateTimeService dateTimeService
) : ITradeProposalHandler
{
    private readonly ITradeProposalRepository _tradeProposalRepository = tradeProposalRepository;
    private readonly IWantlistRepository _wantlistRepository = wantlistRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly ITradeHandler _tradeHandler = tradeHandler;
    private readonly IDateTimeService _dateTimeService = dateTimeService;

    public TradeProposalsResponse GetProposals(string userId)
    {
        var proposals = _tradeProposalRepository.FindUserProposals(userId).ToList();
        var otherUserIds = proposals.Select(proposal => OtherUserId(proposal, userId)).Distinct().ToList();
        var usernames = _userRepository.GetByUserIds(otherUserIds)
            .ToDictionary(user => user.Id, user => user.Username);

        return new(
            proposals
                .OrderByDescending(IsPending)
                .ThenByDescending(proposal => proposal.SentAt)
                .Select(proposal => ToResponse(proposal, userId, usernames))
        );
    }

    public bool SendProposal(string proposerId, SendTradeProposalRequest request)
    {
        // Without quantities, a Card counts once however many times it is sent.
        var givenCards = request.GivenCards.Distinct().ToList();
        var receivedCards = request.ReceivedCards.Distinct().ToList();
        if (givenCards.Count == 0 || receivedCards.Count == 0
            || !AreTradePartners(proposerId, request.RecipientId)
            || !IsInDoublesList(proposerId, givenCards)
            || !IsInDoublesList(request.RecipientId, receivedCards))
            return false;

        var proposalId = Guid.NewGuid().ToString();
        _tradeProposalRepository.Create(
            new TradeProposal(
                proposalId,
                proposerId,
                request.RecipientId,
                _dateTimeService.Now,
                TradeProposalState.Pending
            )
            {
                Cards =
                [
                    .. givenCards.Select(card => new TradeProposalCard(proposalId, card, TradeProposalSide.Proposer)),
                    .. receivedCards.Select(card => new TradeProposalCard(proposalId, card, TradeProposalSide.Recipient)),
                ]
            }
        );
        return true;
    }

    // The proposal form lists the partner's whole Doubles list, so that a proposal can go beyond the Trade match.
    // Only a Trade partner may read it, and only that list: the partner's Wantlists stay private.
    // Returns null when the users are not Trade partners.
    public PartnerDoublesResponse? GetPartnerDoubles(string userId, string partnerId)
    {
        if (!AreTradePartners(userId, partnerId)) return null;

        var doublesCards = _wantlistRepository.GetDoublesList(partnerId)?.Cards ?? [];
        return new(doublesCards.Select(card => card.CardId).Distinct());
    }

    // No Trade partner check: being Trade partners is only required to send.
    public TradeProposalActionResult AcceptProposal(string userId, string proposalId) =>
        Act(userId, proposalId, TradeProposalSide.Recipient, TradeProposalState.Accepted, RefuseMissingCards);

    public TradeProposalActionResult DeclineProposal(string userId, string proposalId) =>
        Act(userId, proposalId, TradeProposalSide.Recipient, TradeProposalState.Declined);

    public TradeProposalActionResult WithdrawProposal(string userId, string proposalId) =>
        Act(userId, proposalId, TradeProposalSide.Proposer, TradeProposalState.Withdrawn);

    // "Remove these cards from my lists", done once by each User of a Trade, on their own lists only.
    // The checked Cards I give leave my Doubles list; the checked Cards I receive leave every one of my
    // Wantlists that holds them. The step is marked done even when nothing is checked.
    public TradeCardsRemovalOutcome RemoveTradeCards(
        string userId,
        string proposalId,
        RemoveTradeCardsRequest request
    )
    {
        var trade = _tradeProposalRepository.FindProposal(proposalId);
        if (trade is null || (trade.ProposerId != userId && trade.RecipientId != userId))
            return TradeCardsRemovalOutcome.NotFound;
        if (CurrentState(trade) != TradeProposalState.Accepted)
            return TradeCardsRemovalOutcome.NotATrade;
        if (trade.HasRemovedCards(userId))
            return TradeCardsRemovalOutcome.AlreadyDone;

        // Whatever the client sends, only the Trade's own Cards, each on its side, may leave my lists.
        var (mySide, otherSide) = trade.ProposerId == userId
            ? (TradeProposalSide.Proposer, TradeProposalSide.Recipient)
            : (TradeProposalSide.Recipient, TradeProposalSide.Proposer);
        var givenCards = request.GivenCards.ToHashSet();
        var receivedCards = request.ReceivedCards.ToHashSet();
        if (!givenCards.IsSubsetOf(CardsGivenBy(trade, mySide))
            || !receivedCards.IsSubsetOf(CardsGivenBy(trade, otherSide)))
            return TradeCardsRemovalOutcome.NotTradeCards;

        // The Doubles list is not one of the Wantlists a received Card leaves: receiving one more copy
        // of a Card leaves my spare copies of it as they were.
        var myLists = _wantlistRepository.GetUserWantlists(userId).ToList();
        List<WantlistCards> listCards =
        [
            .. myLists.Where(DoublesList.IsDoublesList)
                .SelectMany(list => list.Cards)
                .Where(card => givenCards.Contains(card.CardId)),
            .. myLists.Where(list => !DoublesList.IsDoublesList(list))
                .SelectMany(list => list.Cards)
                .Where(card => receivedCards.Contains(card.CardId)),
        ];

        // One write for every removal and the mark, so the step succeeds or fails as a whole.
        return _tradeProposalRepository.TryRemoveTradeCards(trade, mySide, listCards, _dateTimeService.Now)
            ? TradeCardsRemovalOutcome.Done
            : TradeCardsRemovalOutcome.Conflict;
    }

    // Moves a pending proposal to its final state, when the user is the side allowed to.
    private TradeProposalActionResult Act(
        string userId,
        string proposalId,
        TradeProposalSide actingSide,
        TradeProposalState outcome,
        Func<TradeProposal, TradeProposalActionResult?>? refuseBeforeWriting = null
    )
    {
        var proposal = _tradeProposalRepository.FindProposal(proposalId);
        if (proposal is null || (proposal.ProposerId != userId && proposal.RecipientId != userId))
            return new(TradeProposalActionOutcome.NotFound);
        if (UserIdOf(proposal, actingSide) != userId)
            return new(TradeProposalActionOutcome.NotAllowed);
        if (!IsPending(proposal))
            return new(TradeProposalActionOutcome.NotPending);
        if (refuseBeforeWriting?.Invoke(proposal) is { } refusal)
            return refusal;

        // The repository writes the outcome only if the proposal is still pending at that moment.
        return _tradeProposalRepository.TryRespond(proposal, outcome, _dateTimeService.Now)
            ? new(TradeProposalActionOutcome.Done)
            : new(TradeProposalActionOutcome.NotPending);
    }

    // Each Card must still be in the Doubles list of the User who gives it, on both sides.
    private TradeProposalActionResult? RefuseMissingCards(TradeProposal proposal)
    {
        List<string> missingCards =
        [
            .. MissingFromDoublesList(proposal.ProposerId, CardsGivenBy(proposal, TradeProposalSide.Proposer)),
            .. MissingFromDoublesList(proposal.RecipientId, CardsGivenBy(proposal, TradeProposalSide.Recipient)),
        ];
        return missingCards.Count == 0
            ? null
            : new(TradeProposalActionOutcome.MissingCards) { MissingCards = missingCards };
    }

    // How long a proposal waits for an answer, the same for every proposal and defined only here.
    private static readonly TimeSpan ExpiryDelay = TimeSpan.FromDays(7);

    // The one rule for what state a proposal is in now. The Proposals page and the actions both
    // go through it, so a proposal the page shows as pending is one that can be acted on.
    // A proposal still pending is Expired from the instant SentAt + ExpiryDelay on, that instant
    // included. Expired is worked out at each read and never stored: SentAt never changes, so
    // checking it before writing is enough, and the stored state stays Pending.
    private TradeProposalState CurrentState(TradeProposal proposal) =>
        proposal.State == TradeProposalState.Pending && _dateTimeService.Now >= proposal.SentAt + ExpiryDelay
            ? TradeProposalState.Expired
            : proposal.State;

    // Pending and not expired: the proposal can still be accepted, declined or withdrawn.
    private bool IsPending(TradeProposal proposal) => CurrentState(proposal) == TradeProposalState.Pending;

    private static string UserIdOf(TradeProposal proposal, TradeProposalSide side) =>
        side == TradeProposalSide.Proposer ? proposal.ProposerId : proposal.RecipientId;

    private static IEnumerable<string> CardsGivenBy(TradeProposal proposal, TradeProposalSide side) =>
        proposal.Cards.Where(card => card.GivenBy == side).Select(card => card.CardId);

    // Trade partners are the users the Trade page lists, so the rule is checked through it.
    private bool AreTradePartners(string userId, string otherUserId) =>
        _tradeHandler.FindTrades(userId).Users.Any(user => user.Id == otherUserId);

    private bool IsInDoublesList(string userId, IEnumerable<string> cardIds) =>
        !MissingFromDoublesList(userId, cardIds).Any();

    private IEnumerable<string> MissingFromDoublesList(string userId, IEnumerable<string> cardIds)
    {
        var doublesCardIds = _wantlistRepository.GetDoublesList(userId)?.Cards
            .Select(card => card.CardId)
            .ToHashSet() ?? [];
        return cardIds.Where(cardId => !doublesCardIds.Contains(cardId));
    }

    private static string OtherUserId(TradeProposal proposal, string userId) =>
        proposal.ProposerId == userId ? proposal.RecipientId : proposal.ProposerId;

    private TradeProposalResponse ToResponse(
        TradeProposal proposal,
        string userId,
        Dictionary<string, string> usernames
    )
    {
        var isSent = proposal.ProposerId == userId;
        var otherUserId = OtherUserId(proposal, userId);
        var mySide = isSent ? TradeProposalSide.Proposer : TradeProposalSide.Recipient;

        return new(
            proposal.Id,
            isSent,
            otherUserId,
            usernames.GetValueOrDefault(otherUserId) ?? string.Empty,
            proposal.Cards.Where(card => card.GivenBy == mySide).Select(card => card.CardId),
            proposal.Cards.Where(card => card.GivenBy != mySide).Select(card => card.CardId),
            CurrentState(proposal).ToString(),
            proposal.SentAt
        )
        {
            HasRemovedCards = proposal.HasRemovedCards(userId)
        };
    }
}
