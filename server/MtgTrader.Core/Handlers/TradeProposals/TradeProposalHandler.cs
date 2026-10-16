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
                .OrderByDescending(proposal => proposal.State == TradeProposalState.Pending)
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

    // Trade partners are the users the Trade page lists, so the rule is checked through it.
    private bool AreTradePartners(string userId, string otherUserId) =>
        _tradeHandler.FindTrades(userId).Users.Any(user => user.Id == otherUserId);

    private bool IsInDoublesList(string userId, IEnumerable<string> cardIds)
    {
        var doublesCardIds = _wantlistRepository.GetDoublesList(userId)?.Cards
            .Select(card => card.CardId)
            .ToHashSet() ?? [];
        return cardIds.All(doublesCardIds.Contains);
    }

    private static string OtherUserId(TradeProposal proposal, string userId) =>
        proposal.ProposerId == userId ? proposal.RecipientId : proposal.ProposerId;

    private static TradeProposalResponse ToResponse(
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
            proposal.State.ToString(),
            proposal.SentAt
        );
    }
}
