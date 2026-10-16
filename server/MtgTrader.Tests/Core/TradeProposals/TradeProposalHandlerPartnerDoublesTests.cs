using MtgTrader.Core.Handlers.TradeProposals;

namespace MtgTrader.Tests.Core.TradeProposals;

// The proposal form reads the Trade partner's whole Doubles list, the first list of another User the app shows.
// Only a Trade partner may read it, and only that list.
public class TradeProposalHandlerPartnerDoublesTests
{
    private const string Ragavan = "ragavan-mh2";
    private const string SolRing = "sol-ring-c21";
    private const string Thoughtseize = "thoughtseize-ths";
    private const string Brainstorm = "brainstorm-ema";
    private const string LightningBolt = "lightning-bolt-m10";

    private readonly ITradeProposalRepository _tradeProposalRepository;
    private readonly IWantlistRepository _wantlistRepository;
    private readonly ITradeHandler _tradeHandler;
    private readonly ITradeProposalHandler _handler;

    public TradeProposalHandlerPartnerDoublesTests()
    {
        _tradeProposalRepository = Substitute.For<ITradeProposalRepository>();
        _wantlistRepository = Substitute.For<IWantlistRepository>();
        _tradeHandler = Substitute.For<ITradeHandler>();
        _handler = new TradeProposalHandler(
            _tradeProposalRepository,
            _wantlistRepository,
            Substitute.For<IUserRepository>(),
            _tradeHandler,
            Substitute.For<IDateTimeService>()
        );

        // Scenario 1 of the spec: Bob holds the Ragavan Alice wants and wants her Sol Ring.
        GivenTradePartners("alice", "bob");
        GivenDoublesList("alice", SolRing, Thoughtseize);
        GivenDoublesList("bob", Ragavan, Brainstorm);
    }

    [Fact]
    public void Should_return_whole_doubles_list_of_partner_when_users_are_trade_partners()
    {
        var response = _handler.GetPartnerDoubles("alice", "bob");

        response.Should().NotBeNull();
        response!.Cards.Should().BeEquivalentTo([Ragavan, Brainstorm]);
    }

    [Fact]
    public void Should_refuse_to_read_doubles_list_when_users_are_not_trade_partners()
    {
        GivenDoublesList("dave", Brainstorm);

        var response = _handler.GetPartnerDoubles("alice", "dave");

        response.Should().BeNull();
        _wantlistRepository.DidNotReceive().GetDoublesList("dave");
    }

    [Fact]
    public void Should_not_read_partners_wantlists_when_get_partner_doubles()
    {
        var bobsWantlist = new GEntities.Wantlist("bob-wantlist", "wantlist", "bob")
        {
            Cards = [new WantlistCards("bob-wantlist", SolRing), new WantlistCards("bob-wantlist", LightningBolt)]
        };
        _wantlistRepository.GetUserWantlists("bob").Returns([bobsWantlist]);
        _wantlistRepository.GetUsersWantlists(default!).ReturnsForAnyArgs([bobsWantlist]);

        var response = _handler.GetPartnerDoubles("alice", "bob");

        response!.Cards.Should().BeEquivalentTo([Ragavan, Brainstorm]);
        _wantlistRepository.DidNotReceive().GetUserWantlists("bob");
        _wantlistRepository.DidNotReceiveWithAnyArgs().GetUsersWantlists(default!);
    }

    [Fact]
    public void Should_return_each_card_once_when_get_partner_doubles()
    {
        GivenDoublesList("bob", Ragavan, Brainstorm, Ragavan);

        var response = _handler.GetPartnerDoubles("alice", "bob");

        response!.Cards.Should().Equal(Ragavan, Brainstorm);
    }

    [Fact]
    public void Should_return_no_card_when_partner_has_no_doubles_list()
    {
        _wantlistRepository.GetDoublesList("bob").ReturnsNull();

        var response = _handler.GetPartnerDoubles("alice", "bob");

        response.Should().NotBeNull();
        response!.Cards.Should().BeEmpty();
    }

    [Fact]
    public void Should_accept_received_card_outside_trade_match_when_it_is_in_partners_doubles_list()
    {
        var sent = _handler.SendProposal("alice", new("bob", [SolRing], [Ragavan, Brainstorm]));

        sent.Should().BeTrue();
        _tradeProposalRepository.Received(1).Create(
            Arg.Is<TradeProposal>(proposal => proposal.Cards.Any(card =>
                card.CardId == Brainstorm && card.GivenBy == TradeProposalSide.Recipient))
        );
    }

    private void GivenTradePartners(string userId, params string[] partnerIds)
    {
        _tradeHandler.FindTrades(userId).Returns(
            new TradeableResponse([.. partnerIds.Select(id => new UserTradeResponse(id, id, [], []))])
        );
    }

    private void GivenDoublesList(string userId, params string[] cardIds)
    {
        var doublesId = DoublesList.IdFor(userId);
        _wantlistRepository.GetDoublesList(userId).Returns(
            new GEntities.Wantlist(doublesId, "doubles", userId)
            {
                Cards = [.. cardIds.Select(card => new WantlistCards(doublesId, card))]
            }
        );
    }
}
