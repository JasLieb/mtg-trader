using MtgTrader.Core.Handlers.TradeProposals;

namespace MtgTrader.Tests.Core.TradeProposals;

public class TradeProposalHandlerTests
{
    private const string Ragavan = "ragavan-mh2";
    private const string SolRing = "sol-ring-c21";
    private const string Thoughtseize = "thoughtseize-ths";
    private const string Brainstorm = "brainstorm-ema";

    private static readonly DateTime Now = new(2026, 10, 16, 9, 30, 0, DateTimeKind.Utc);

    private readonly ITradeProposalRepository _tradeProposalRepository;
    private readonly IWantlistRepository _wantlistRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITradeHandler _tradeHandler;
    private readonly ITradeProposalHandler _handler;

    public TradeProposalHandlerTests()
    {
        _tradeProposalRepository = Substitute.For<ITradeProposalRepository>();
        _wantlistRepository = Substitute.For<IWantlistRepository>();
        _userRepository = Substitute.For<IUserRepository>();
        _tradeHandler = Substitute.For<ITradeHandler>();
        var dateTimeService = Substitute.For<IDateTimeService>();
        dateTimeService.Now.Returns(Now);
        _handler = new TradeProposalHandler(
            _tradeProposalRepository,
            _wantlistRepository,
            _userRepository,
            _tradeHandler,
            dateTimeService
        );

        GivenTradePartners("alice", "bob");
        GivenDoublesList("alice", SolRing, Thoughtseize);
        GivenDoublesList("bob", Ragavan, Brainstorm);
    }

    [Fact]
    public void Should_create_pending_proposal_when_send_cards_from_both_doubles_lists()
    {
        TradeProposal? created = null;
        _tradeProposalRepository.Create(Arg.Do<TradeProposal>(proposal => created = proposal));

        var sent = _handler.SendProposal("alice", new("bob", [SolRing], [Ragavan]));

        sent.Should().BeTrue();
        created.Should().NotBeNull();
        created!.ProposerId.Should().Be("alice");
        created.RecipientId.Should().Be("bob");
        created.State.Should().Be(TradeProposalState.Pending);
        created.SentAt.Should().Be(Now);
        created.Cards.Should().BeEquivalentTo(
            [
                new { TradeProposalId = created.Id, CardId = SolRing, GivenBy = TradeProposalSide.Proposer },
                new { TradeProposalId = created.Id, CardId = Ragavan, GivenBy = TradeProposalSide.Recipient },
            ]
        );
    }

    [Fact]
    public void Should_accept_card_outside_trade_match_when_it_is_in_the_givers_doubles_list()
    {
        var sent = _handler.SendProposal("alice", new("bob", [SolRing, Thoughtseize], [Ragavan]));

        sent.Should().BeTrue();
        _tradeProposalRepository.Received(1).Create(
            Arg.Is<TradeProposal>(proposal => proposal.Cards.Count == 3)
        );
    }

    [Fact]
    public void Should_count_each_card_once_when_it_is_sent_twice()
    {
        _handler.SendProposal("alice", new("bob", [SolRing, SolRing], [Ragavan]));

        _tradeProposalRepository.Received(1).Create(
            Arg.Is<TradeProposal>(proposal => proposal.Cards.Count(card => card.CardId == SolRing) == 1)
        );
    }

    [Fact]
    public void Should_refuse_proposal_when_no_card_is_given()
    {
        ShouldRefuse(_handler.SendProposal("alice", new("bob", [], [Ragavan])));
    }

    [Fact]
    public void Should_refuse_proposal_when_no_card_is_received()
    {
        ShouldRefuse(_handler.SendProposal("alice", new("bob", [SolRing], [])));
    }

    [Fact]
    public void Should_refuse_proposal_when_recipient_is_not_a_trade_partner()
    {
        GivenDoublesList("dave", Ragavan);

        ShouldRefuse(_handler.SendProposal("alice", new("dave", [SolRing], [Ragavan])));
    }

    [Fact]
    public void Should_refuse_proposal_when_given_card_is_not_in_proposers_doubles_list()
    {
        ShouldRefuse(_handler.SendProposal("alice", new("bob", [Brainstorm], [Ragavan])));
    }

    [Fact]
    public void Should_refuse_proposal_when_received_card_is_not_in_recipients_doubles_list()
    {
        ShouldRefuse(_handler.SendProposal("alice", new("bob", [SolRing], [Thoughtseize])));
    }

    [Fact]
    public void Should_refuse_proposal_when_recipient_has_no_doubles_list()
    {
        _wantlistRepository.GetDoublesList("bob").ReturnsNull();

        ShouldRefuse(_handler.SendProposal("alice", new("bob", [SolRing], [Ragavan])));
    }

    [Fact]
    public void Should_show_sent_proposal_from_proposers_point_of_view_when_get_proposals()
    {
        GivenProposals("alice", MakeProposal("p1", "alice", "bob", Now, [SolRing], [Ragavan]));
        GivenUsers("bob");

        var response = _handler.GetProposals("alice");

        response.Proposals.Should().ContainSingle().Which.Should().BeEquivalentTo(
            new TradeProposalResponse("p1", true, "bob", "bob@mail", [SolRing], [Ragavan], "Pending", Now)
        );
    }

    [Fact]
    public void Should_show_received_proposal_from_recipients_point_of_view_when_get_proposals()
    {
        GivenProposals("bob", MakeProposal("p1", "alice", "bob", Now, [SolRing], [Ragavan]));
        GivenUsers("alice");

        var response = _handler.GetProposals("bob");

        response.Proposals.Should().ContainSingle().Which.Should().BeEquivalentTo(
            new TradeProposalResponse("p1", false, "alice", "alice@mail", [Ragavan], [SolRing], "Pending", Now)
        );
    }

    [Fact]
    public void Should_list_pending_proposals_first_then_newest_when_get_proposals()
    {
        var accepted = MakeProposal("accepted", "alice", "bob", Now, [SolRing], [Ragavan]);
        accepted.State = TradeProposalState.Accepted;
        GivenProposals(
            "alice",
            MakeProposal("old-pending", "alice", "bob", Now.AddDays(-2), [SolRing], [Ragavan]),
            accepted,
            MakeProposal("new-pending", "bob", "alice", Now.AddDays(-1), [Ragavan], [SolRing])
        );
        GivenUsers("bob");

        var response = _handler.GetProposals("alice");

        response.Proposals.Select(proposal => proposal.Id).Should().Equal("new-pending", "old-pending", "accepted");
    }

    private void ShouldRefuse(bool sent)
    {
        sent.Should().BeFalse();
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().Create(default!);
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

    private void GivenProposals(string userId, params TradeProposal[] proposals)
    {
        _tradeProposalRepository.FindUserProposals(userId).Returns(proposals);
    }

    private void GivenUsers(params string[] userIds)
    {
        _userRepository.GetByUserIds(default!).ReturnsForAnyArgs(
            userIds.Select(id => new User(id, $"{id}@mail", "")).ToList()
        );
    }

    private static TradeProposal MakeProposal(
        string id,
        string proposerId,
        string recipientId,
        DateTime sentAt,
        string[] givenByProposer,
        string[] givenByRecipient
    ) =>
        new(id, proposerId, recipientId, sentAt, TradeProposalState.Pending)
        {
            Cards =
            [
                .. givenByProposer.Select(card => new TradeProposalCard(id, card, TradeProposalSide.Proposer)),
                .. givenByRecipient.Select(card => new TradeProposalCard(id, card, TradeProposalSide.Recipient)),
            ]
        };
}
