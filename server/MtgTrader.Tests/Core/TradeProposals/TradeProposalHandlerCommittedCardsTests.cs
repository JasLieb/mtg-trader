using System.Text.Json;
using MtgTrader.Core.Handlers.TradeProposals;

namespace MtgTrader.Tests.Core.TradeProposals;

// Committed Cards: the Cards a User gives in a proposal still pending, or in a Trade whose Cards that
// User has not yet removed from their lists. Starts from the lists of the spec and from the proposal of
// its scenario 1: Alice gives her Sol Ring and Thoughtseize to Bob for his Ragavan.
public class TradeProposalHandlerCommittedCardsTests
{
    private const string Ragavan = "ragavan-mh2";
    private const string SolRing = "sol-ring-c21";
    private const string Counterspell = "counterspell-mh2";
    private const string Thoughtseize = "thoughtseize-ths";
    private const string Brainstorm = "brainstorm-ema";

    private static readonly DateTime Now = new(2026, 10, 16, 9, 30, 0, DateTimeKind.Utc);

    private readonly ITradeProposalRepository _tradeProposalRepository;
    private readonly IWantlistRepository _wantlistRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITradeHandler _tradeHandler;
    private readonly ITradeProposalHandler _handler;

    public TradeProposalHandlerCommittedCardsTests()
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

        // Usernames differ from ids, so the tests see that the warning names the other User.
        _userRepository.GetByUserIds(default!).ReturnsForAnyArgs(
            [
                new User("alice", "Alice", ""),
                new User("bob", "Bob", ""),
                new User("carol", "Carol", ""),
                new User("dave", "Dave", ""),
            ]
        );
        GivenDoublesList("alice", SolRing, Counterspell, Thoughtseize);
        GivenDoublesList("bob", Ragavan, Brainstorm);
        GivenDoublesList("carol", Brainstorm);
        _tradeProposalRepository.TryRespond(default!, default, default).ReturnsForAnyArgs(true);
    }

    public static TheoryData<TradeProposalState> AnsweredWithoutTrade =>
        new() { TradeProposalState.Declined, TradeProposalState.Withdrawn };

    // Scenario 4 of the spec: before sending her proposal to Carol, Alice is told that Sol Ring is
    // committed with Bob, as is Thoughtseize.
    [Fact]
    public void Should_report_cards_committed_with_bob_when_alice_gives_them_in_her_pending_proposal_to_him()
    {
        GivenProposals(Scenario1());

        var committed = Committed(_handler.GetCommittedCards("alice"));

        committed.Should().BeEquivalentTo(
            new Dictionary<string, string[]> { [SolRing] = ["Bob"], [Thoughtseize] = ["Bob"] }
        );
    }

    // Scenario 4 of the spec: the warning blocks nothing.
    [Fact]
    public void Should_send_proposal_when_a_given_card_is_already_committed()
    {
        GivenProposals(Scenario1());
        _tradeHandler.FindTrades("alice").Returns(
            new TradeableResponse([new UserTradeResponse("carol", "Carol", [], [])])
        );

        var sent = _handler.SendProposal("alice", new("carol", [SolRing], [Brainstorm]));

        sent.Should().BeTrue();
        _tradeProposalRepository.Received(1).Create(
            Arg.Is<TradeProposal>(proposal => proposal.RecipientId == "carol")
        );
    }

    // A Card may be committed in several proposals: each other User is named, once.
    [Fact]
    public void Should_name_each_other_user_once_when_a_card_is_committed_in_several_proposals()
    {
        GivenProposals(
            Scenario1(),
            Proposal("p2", "alice", "bob", [SolRing], [Ragavan]),
            Proposal("p3", "alice", "carol", [SolRing], [Brainstorm])
        );

        var committed = Committed(_handler.GetCommittedCards("alice"));

        committed[SolRing].Should().Equal("Bob", "Carol");
    }

    // A Card I would receive is not mine to commit.
    [Fact]
    public void Should_not_report_a_card_the_user_would_receive()
    {
        GivenProposals(Scenario1());

        var committed = Committed(_handler.GetCommittedCards("alice"));

        committed.Should().NotContainKey(Ragavan);
    }

    // A pending proposal commits the Cards of both its Users, whoever sent it.
    [Fact]
    public void Should_report_card_committed_when_the_user_gives_it_in_a_pending_proposal_they_received()
    {
        GivenProposals(Scenario1());

        var committed = Committed(_handler.GetCommittedCards("bob"));

        committed.Should().BeEquivalentTo(new Dictionary<string, string[]> { [Ragavan] = ["Alice"] });
    }

    [Fact]
    public void Should_report_card_committed_when_the_user_has_not_removed_the_cards_of_a_trade()
    {
        GivenProposals(Scenario1(TradeProposalState.Accepted));

        Committed(_handler.GetCommittedCards("alice")).Should().ContainKey(SolRing);
        Committed(_handler.GetCommittedCards("bob")).Should().ContainKey(Ragavan);
    }

    [Fact]
    public void Should_not_report_card_when_the_user_has_removed_the_cards_of_the_trade()
    {
        var trade = Scenario1(TradeProposalState.Accepted);
        trade.ProposerRemovedCardsAt = Now.AddHours(-1);
        GivenProposals(trade);

        Committed(_handler.GetCommittedCards("alice")).Should().BeEmpty();
    }

    // The step is each User's own: Alice's step frees her Cards, not Bob's.
    [Fact]
    public void Should_report_card_when_only_the_other_user_has_removed_the_cards_of_the_trade()
    {
        var trade = Scenario1(TradeProposalState.Accepted);
        trade.ProposerRemovedCardsAt = Now.AddHours(-1);
        GivenProposals(trade);

        Committed(_handler.GetCommittedCards("bob")).Should().BeEquivalentTo(
            new Dictionary<string, string[]> { [Ragavan] = ["Alice"] }
        );
    }

    // A Trade does not expire: its Cards stay committed until the step is done.
    [Fact]
    public void Should_report_card_when_trade_was_sent_more_than_7_days_ago_and_its_cards_were_not_removed()
    {
        GivenProposals(Scenario1(TradeProposalState.Accepted, sentAt: Now.AddDays(-30)));

        Committed(_handler.GetCommittedCards("alice")).Should().ContainKey(SolRing);
    }

    [Theory]
    [MemberData(nameof(AnsweredWithoutTrade))]
    public void Should_not_report_card_when_proposal_was_declined_or_withdrawn(TradeProposalState state)
    {
        GivenProposals(Scenario1(state));

        Committed(_handler.GetCommittedCards("alice")).Should().BeEmpty();
        Committed(_handler.GetCommittedCards("bob")).Should().BeEmpty();
    }

    [Fact]
    public void Should_not_report_card_when_proposal_has_expired()
    {
        GivenProposals(Scenario1(sentAt: Now.AddDays(-7)));

        Committed(_handler.GetCommittedCards("alice")).Should().BeEmpty();
        Committed(_handler.GetCommittedCards("bob")).Should().BeEmpty();
    }

    [Fact]
    public void Should_report_card_when_proposal_was_sent_just_under_7_days_ago()
    {
        GivenProposals(Scenario1(sentAt: Now.AddDays(-7) + TimeSpan.FromTicks(1)));

        Committed(_handler.GetCommittedCards("alice")).Should().ContainKey(SolRing);
    }

    [Fact]
    public void Should_report_no_card_when_the_user_has_no_proposal()
    {
        GivenProposals();

        _handler.GetCommittedCards("alice").CommittedCards.Should().BeEmpty();
    }

    // Scenario 9 of the spec: Bob's Ragavan is also in another of his proposals, the one he sent to
    // Alice for her Counterspell. He is warned before accepting hers.
    [Fact]
    public void Should_warn_recipient_that_a_card_they_give_is_committed_in_another_proposal_when_accepting()
    {
        GivenProposals(Scenario1(), Proposal("p2", "bob", "alice", [Ragavan], [Counterspell]));

        var committed = _handler.GetCommittedCardsIn("bob", "p1");

        Committed(committed!).Should().BeEquivalentTo(
            new Dictionary<string, string[]> { [Ragavan] = ["Alice"] }
        );
    }

    // Scenario 9 of the spec: once warned, Bob confirms and the proposal becomes a Trade.
    [Fact]
    public void Should_accept_proposal_when_a_card_the_recipient_gives_is_committed_in_another_proposal()
    {
        GivenProposals(Scenario1(), Proposal("p2", "bob", "alice", [Ragavan], [Counterspell]));

        var result = _handler.AcceptProposal("bob", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.Done);
        _tradeProposalRepository.Received(1).TryRespond(
            Arg.Is<TradeProposal>(proposal => proposal.Id == "p1"),
            TradeProposalState.Accepted,
            Now
        );
    }

    [Fact]
    public void Should_name_the_user_of_the_trade_that_commits_the_card_when_accepting()
    {
        var tradeWithDave = Proposal("t1", "dave", "bob", [Counterspell], [Ragavan], TradeProposalState.Accepted);
        GivenProposals(Scenario1(), tradeWithDave);

        var committed = _handler.GetCommittedCardsIn("bob", "p1");

        Committed(committed!).Should().BeEquivalentTo(
            new Dictionary<string, string[]> { [Ragavan] = ["Dave"] }
        );
    }

    // The proposal being accepted commits its Cards, but it is not counted against itself.
    [Fact]
    public void Should_not_count_the_proposal_being_accepted()
    {
        GivenProposals(Scenario1());

        _handler.GetCommittedCardsIn("bob", "p1")!.CommittedCards.Should().BeEmpty();
    }

    // Only the Cards the user gives in the proposal being accepted are concerned.
    [Fact]
    public void Should_not_warn_about_a_committed_card_the_user_does_not_give_in_that_proposal()
    {
        GivenProposals(Scenario1(), Proposal("p2", "bob", "alice", [Brainstorm], [Counterspell]));

        _handler.GetCommittedCardsIn("bob", "p1")!.CommittedCards.Should().BeEmpty();
    }

    [Fact]
    public void Should_not_warn_when_accepting_about_a_trade_whose_cards_the_recipient_removed()
    {
        var trade = Proposal("t1", "dave", "bob", [Counterspell], [Ragavan], TradeProposalState.Accepted);
        trade.RecipientRemovedCardsAt = Now.AddHours(-1);
        GivenProposals(Scenario1(), trade);

        _handler.GetCommittedCardsIn("bob", "p1")!.CommittedCards.Should().BeEmpty();
    }

    [Theory]
    [MemberData(nameof(AnsweredWithoutTrade))]
    public void Should_not_warn_when_accepting_about_a_declined_or_withdrawn_proposal(TradeProposalState state)
    {
        GivenProposals(Scenario1(), Proposal("p2", "bob", "alice", [Ragavan], [Counterspell], state));

        _handler.GetCommittedCardsIn("bob", "p1")!.CommittedCards.Should().BeEmpty();
    }

    [Fact]
    public void Should_not_warn_when_accepting_about_an_expired_proposal()
    {
        GivenProposals(
            Scenario1(),
            Proposal("p2", "bob", "alice", [Ragavan], [Counterspell], sentAt: Now.AddDays(-8))
        );

        _handler.GetCommittedCardsIn("bob", "p1")!.CommittedCards.Should().BeEmpty();
    }

    // The other User of the proposal never sees the warning: Alice asking about p1 only ever hears of
    // her own Cards, never of Bob's Ragavan, however committed it is.
    [Fact]
    public void Should_never_report_the_cards_of_the_other_user_of_the_proposal()
    {
        GivenProposals(
            Scenario1(),
            Proposal("p2", "bob", "dave", [Ragavan], [Counterspell]),
            Proposal("p3", "alice", "carol", [SolRing], [Brainstorm])
        );

        var committed = _handler.GetCommittedCardsIn("alice", "p1");

        Committed(committed!).Should().BeEquivalentTo(
            new Dictionary<string, string[]> { [SolRing] = ["Carol"] }
        );
    }

    // The proposals both Users read carry nothing about Committed Cards.
    [Fact]
    public void Should_not_reveal_committed_cards_in_the_proposals_shared_with_the_other_user()
    {
        GivenProposals(Scenario1(), Proposal("p2", "bob", "dave", [Ragavan], [Counterspell]));

        var json = JsonSerializer.Serialize(_handler.GetProposals("alice"));

        json.Should().NotContainEquivalentOf("committed");
        json.Should().NotContain("Dave");
    }

    [Fact]
    public void Should_answer_nothing_when_proposal_does_not_exist()
    {
        GivenProposals(Scenario1());

        _handler.GetCommittedCardsIn("bob", "unknown").Should().BeNull();
    }

    [Fact]
    public void Should_answer_nothing_when_user_is_neither_proposer_nor_recipient()
    {
        GivenProposals(Scenario1(), Proposal("p2", "carol", "alice", [Brainstorm], [SolRing]));

        _handler.GetCommittedCardsIn("carol", "p1").Should().BeNull();
        _tradeProposalRepository.DidNotReceive().FindUserProposals("carol");
    }

    private static Dictionary<string, string[]> Committed(CommittedCardsResponse response) =>
        response.CommittedCards.ToDictionary(card => card.CardId, card => card.CommittedWith.ToArray());

    // Scenario 1 of the spec: Alice gives her Sol Ring and Thoughtseize to Bob for his Ragavan.
    private static TradeProposal Scenario1(
        TradeProposalState state = TradeProposalState.Pending,
        DateTime? sentAt = null
    ) => Proposal("p1", "alice", "bob", [SolRing, Thoughtseize], [Ragavan], state, sentAt);

    private static TradeProposal Proposal(
        string id,
        string proposerId,
        string recipientId,
        string[] givenByProposer,
        string[] givenByRecipient,
        TradeProposalState state = TradeProposalState.Pending,
        DateTime? sentAt = null
    ) =>
        new(id, proposerId, recipientId, sentAt ?? Now.AddDays(-1), state)
        {
            Cards =
            [
                .. givenByProposer.Select(card => new TradeProposalCard(id, card, TradeProposalSide.Proposer)),
                .. givenByRecipient.Select(card => new TradeProposalCard(id, card, TradeProposalSide.Recipient)),
            ]
        };

    // Like the repository, each User reads only the proposals they are a party to.
    private void GivenProposals(params TradeProposal[] proposals)
    {
        foreach (var userId in new[] { "alice", "bob", "carol", "dave" })
            _tradeProposalRepository.FindUserProposals(userId).Returns(
                [.. proposals.Where(proposal => proposal.ProposerId == userId || proposal.RecipientId == userId)]
            );
        foreach (var proposal in proposals)
            _tradeProposalRepository.FindProposal(proposal.Id).Returns(proposal);
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
