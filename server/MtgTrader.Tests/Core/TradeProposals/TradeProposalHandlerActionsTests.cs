using MtgTrader.Core.Handlers.TradeProposals;
using NSubstitute.Extensions;

namespace MtgTrader.Tests.Core.TradeProposals;

// Accept, decline and withdraw. Starts from the proposal of scenario 1 of the spec:
// Alice gives her Sol Ring to Bob for his Ragavan.
public class TradeProposalHandlerActionsTests
{
    private const string Ragavan = "ragavan-mh2";
    private const string SolRing = "sol-ring-c21";
    private const string Thoughtseize = "thoughtseize-ths";
    private const string Brainstorm = "brainstorm-ema";

    private const string Accept = "accept";
    private const string Decline = "decline";
    private const string Withdraw = "withdraw";

    private static readonly DateTime Now = new(2026, 10, 16, 9, 30, 0, DateTimeKind.Utc);

    private readonly ITradeProposalRepository _tradeProposalRepository;
    private readonly IWantlistRepository _wantlistRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITradeHandler _tradeHandler;
    private readonly ITradeProposalHandler _handler;
    private readonly TradeProposal _proposal;

    public TradeProposalHandlerActionsTests()
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

        GivenDoublesList("alice", SolRing, Thoughtseize);
        GivenDoublesList("bob", Ragavan, Brainstorm);
        _proposal = new("p1", "alice", "bob", Now.AddDays(-1), TradeProposalState.Pending)
        {
            Cards =
            [
                new("p1", SolRing, TradeProposalSide.Proposer),
                new("p1", Ragavan, TradeProposalSide.Recipient),
            ]
        };
        _tradeProposalRepository.FindProposal("p1").Returns(_proposal);
        // Like the real repository, a successful write leaves the proposal in its outcome.
        _tradeProposalRepository.TryRespond(default!, default, default).ReturnsForAnyArgs(call =>
        {
            call.Arg<TradeProposal>().State = call.Arg<TradeProposalState>();
            call.Arg<TradeProposal>().RespondedAt = call.Arg<DateTime>();
            return true;
        });
    }

    public static TheoryData<string> Actions => new() { Accept, Decline, Withdraw };

    public static TheoryData<string, TradeProposalState> ActionsOnFinalStates
    {
        get
        {
            var data = new TheoryData<string, TradeProposalState>();
            foreach (var action in new[] { Accept, Decline, Withdraw })
                foreach (var state in new[] { TradeProposalState.Accepted, TradeProposalState.Declined, TradeProposalState.Withdrawn })
                    data.Add(action, state);
            return data;
        }
    }

    [Fact]
    public void Should_accept_proposal_when_recipient_accepts_it_while_pending()
    {
        var result = _handler.AcceptProposal("bob", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.Done);
        _tradeProposalRepository.Received(1).TryRespond(_proposal, TradeProposalState.Accepted, Now);
    }

    [Fact]
    public void Should_decline_proposal_when_recipient_declines_it_while_pending()
    {
        var result = _handler.DeclineProposal("bob", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.Done);
        _tradeProposalRepository.Received(1).TryRespond(_proposal, TradeProposalState.Declined, Now);
    }

    [Fact]
    public void Should_withdraw_proposal_when_proposer_withdraws_it_while_pending()
    {
        var result = _handler.WithdrawProposal("alice", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.Done);
        _tradeProposalRepository.Received(1).TryRespond(_proposal, TradeProposalState.Withdrawn, Now);
    }

    // Scenario 5 of the spec.
    [Fact]
    public void Should_refuse_acceptance_when_proposer_has_withdrawn_the_proposal()
    {
        _handler.WithdrawProposal("alice", "p1");
        _tradeProposalRepository.ClearReceivedCalls();

        var result = _handler.AcceptProposal("bob", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.NotPending);
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().TryRespond(default!, default, default);
        GivenProposals("bob", _proposal);
        _handler.GetProposals("bob").Proposals.Should().ContainSingle()
            .Which.State.Should().Be("Withdrawn");
    }

    // Scenario 7 of the spec.
    [Fact]
    public void Should_refuse_acceptance_and_name_the_card_when_a_given_card_left_the_proposers_doubles_list()
    {
        GivenDoublesList("alice", Thoughtseize);

        var result = _handler.AcceptProposal("bob", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.MissingCards);
        result.MissingCards.Should().Equal(SolRing);
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().TryRespond(default!, default, default);
        _proposal.State.Should().Be(TradeProposalState.Pending);
    }

    [Fact]
    public void Should_refuse_acceptance_and_name_the_card_when_a_received_card_left_the_recipients_doubles_list()
    {
        GivenDoublesList("bob", Brainstorm);

        var result = _handler.AcceptProposal("bob", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.MissingCards);
        result.MissingCards.Should().Equal(Ragavan);
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().TryRespond(default!, default, default);
    }

    [Fact]
    public void Should_name_the_missing_cards_of_both_sides_when_acceptance_is_refused()
    {
        GivenDoublesList("alice");
        _wantlistRepository.GetDoublesList("bob").ReturnsNull();

        var result = _handler.AcceptProposal("bob", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.MissingCards);
        result.MissingCards.Should().BeEquivalentTo([SolRing, Ragavan]);
    }

    // Scenario 8 of the spec: being Trade partners is only required to send.
    [Fact]
    public void Should_accept_proposal_when_users_are_no_longer_trade_partners()
    {
        _tradeHandler.FindTrades(default!).ReturnsForAnyArgs(new TradeableResponse([]));

        var result = _handler.AcceptProposal("bob", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.Done);
        _tradeHandler.DidNotReceiveWithAnyArgs().FindTrades(default!);
    }

    [Fact]
    public void Should_decline_proposal_when_its_cards_left_the_doubles_lists()
    {
        GivenDoublesList("alice");
        GivenDoublesList("bob");

        var result = _handler.DeclineProposal("bob", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.Done);
    }

    [Fact]
    public void Should_withdraw_proposal_when_its_cards_left_the_doubles_lists()
    {
        GivenDoublesList("alice");
        GivenDoublesList("bob");

        var result = _handler.WithdrawProposal("alice", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.Done);
    }

    [Fact]
    public void Should_refuse_acceptance_when_proposer_accepts_their_own_proposal()
    {
        ShouldRefuse(_handler.AcceptProposal("alice", "p1"), TradeProposalActionOutcome.NotAllowed);
    }

    [Fact]
    public void Should_refuse_decline_when_proposer_declines_their_own_proposal()
    {
        ShouldRefuse(_handler.DeclineProposal("alice", "p1"), TradeProposalActionOutcome.NotAllowed);
    }

    [Fact]
    public void Should_refuse_withdrawal_when_recipient_withdraws_the_proposal()
    {
        ShouldRefuse(_handler.WithdrawProposal("bob", "p1"), TradeProposalActionOutcome.NotAllowed);
    }

    [Theory]
    [MemberData(nameof(Actions))]
    public void Should_refuse_action_when_user_is_neither_proposer_nor_recipient(string action)
    {
        ShouldRefuse(Act(action, "carol", "p1"), TradeProposalActionOutcome.NotFound);
    }

    [Theory]
    [MemberData(nameof(Actions))]
    public void Should_refuse_action_when_proposal_does_not_exist(string action)
    {
        ShouldRefuse(Act(action, ActingUser(action), "unknown"), TradeProposalActionOutcome.NotFound);
    }

    [Theory]
    [MemberData(nameof(ActionsOnFinalStates))]
    public void Should_refuse_action_when_proposal_is_no_longer_pending(string action, TradeProposalState state)
    {
        _proposal.State = state;

        ShouldRefuse(Act(action, ActingUser(action), "p1"), TradeProposalActionOutcome.NotPending);
        _proposal.State.Should().Be(state);
    }

    [Theory]
    [MemberData(nameof(Actions))]
    public void Should_refuse_action_when_another_action_was_written_first(string action)
    {
        _tradeProposalRepository.Configure().TryRespond(default!, default, default).ReturnsForAnyArgs(false);

        var result = Act(action, ActingUser(action), "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.NotPending);
    }

    private TradeProposalActionResult Act(string action, string userId, string proposalId) =>
        action switch
        {
            Accept => _handler.AcceptProposal(userId, proposalId),
            Decline => _handler.DeclineProposal(userId, proposalId),
            _ => _handler.WithdrawProposal(userId, proposalId),
        };

    // Bob, the recipient, accepts or declines; Alice, the proposer, withdraws.
    private static string ActingUser(string action) => action == Withdraw ? "alice" : "bob";

    private void ShouldRefuse(TradeProposalActionResult result, TradeProposalActionOutcome outcome)
    {
        result.Outcome.Should().Be(outcome);
        result.MissingCards.Should().BeEmpty();
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().TryRespond(default!, default, default);
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
        _userRepository.GetByUserIds(default!).ReturnsForAnyArgs(
            [new User("alice", "alice@mail", ""), new User("bob", "bob@mail", "")]
        );
    }
}
