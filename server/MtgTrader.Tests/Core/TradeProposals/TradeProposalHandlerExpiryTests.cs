using MtgTrader.Core.Handlers.TradeProposals;

namespace MtgTrader.Tests.Core.TradeProposals;

// A proposal still pending 7 days after it was sent is Expired, from that very instant on.
// Starts from the proposal of scenario 1 of the spec, Alice's Sol Ring for Bob's Ragavan,
// and moves the clock around its deadline.
public class TradeProposalHandlerExpiryTests
{
    private const string Ragavan = "ragavan-mh2";
    private const string SolRing = "sol-ring-c21";
    private const string Thoughtseize = "thoughtseize-ths";
    private const string Brainstorm = "brainstorm-ema";

    private const string Accept = "accept";
    private const string Decline = "decline";
    private const string Withdraw = "withdraw";

    private static readonly DateTime SentAt = new(2026, 10, 9, 9, 30, 0, DateTimeKind.Utc);
    // Written out rather than read from the handler, so that a change of the delay fails here.
    private static readonly DateTime SevenDaysAfterSending = SentAt.AddDays(7);
    private static readonly TimeSpan OneTick = TimeSpan.FromTicks(1);

    private readonly ITradeProposalRepository _tradeProposalRepository;
    private readonly IWantlistRepository _wantlistRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITradeHandler _tradeHandler;
    private readonly IDateTimeService _dateTimeService;
    private readonly ITradeProposalHandler _handler;
    private readonly TradeProposal _proposal;

    public TradeProposalHandlerExpiryTests()
    {
        _tradeProposalRepository = Substitute.For<ITradeProposalRepository>();
        _wantlistRepository = Substitute.For<IWantlistRepository>();
        _userRepository = Substitute.For<IUserRepository>();
        _tradeHandler = Substitute.For<ITradeHandler>();
        _dateTimeService = Substitute.For<IDateTimeService>();
        _handler = new TradeProposalHandler(
            _tradeProposalRepository,
            _wantlistRepository,
            _userRepository,
            _tradeHandler,
            _dateTimeService
        );

        GivenDoublesList("alice", SolRing, Thoughtseize);
        GivenDoublesList("bob", Ragavan, Brainstorm);
        _proposal = MakeProposal("p1", SentAt);
        _tradeProposalRepository.FindProposal("p1").Returns(_proposal);
        GivenProposals(_proposal);
        _userRepository.GetByUserIds(default!).ReturnsForAnyArgs(
            [new User("alice", "alice@mail", ""), new User("bob", "bob@mail", "")]
        );
        _tradeProposalRepository.TryRespond(default!, default, default).ReturnsForAnyArgs(true);
    }

    public static TheoryData<string> Actions => new() { Accept, Decline, Withdraw };

    // At the deadline itself, then just after it.
    public static TheoryData<string, long> ActionsOnceExpired
    {
        get
        {
            var data = new TheoryData<string, long>();
            foreach (var action in new[] { Accept, Decline, Withdraw })
                foreach (var ticksAfterDeadline in new long[] { 0, 1 })
                    data.Add(action, ticksAfterDeadline);
            return data;
        }
    }

    public static TheoryData<TradeProposalState> FinalStates =>
        new() { TradeProposalState.Accepted, TradeProposalState.Declined, TradeProposalState.Withdrawn };

    [Fact]
    public void Should_show_proposal_pending_to_both_users_when_it_was_sent_just_under_7_days_ago()
    {
        GivenNow(SevenDaysAfterSending - OneTick);

        StateSeenBy("alice").Should().Be("Pending");
        StateSeenBy("bob").Should().Be("Pending");
    }

    // Scenario 6 of the spec, at the boundary: 7 days have passed, so the proposal has expired.
    [Fact]
    public void Should_show_proposal_expired_to_both_users_when_it_was_sent_exactly_7_days_ago()
    {
        GivenNow(SevenDaysAfterSending);

        StateSeenBy("alice").Should().Be("Expired");
        StateSeenBy("bob").Should().Be("Expired");
    }

    [Fact]
    public void Should_show_proposal_expired_to_both_users_when_it_was_sent_just_over_7_days_ago()
    {
        GivenNow(SevenDaysAfterSending + OneTick);

        StateSeenBy("alice").Should().Be("Expired");
        StateSeenBy("bob").Should().Be("Expired");
    }

    // Scenario 6 of the spec.
    [Fact]
    public void Should_refuse_acceptance_when_proposal_has_had_no_answer_for_7_days()
    {
        GivenNow(SevenDaysAfterSending.AddHours(1));

        var result = _handler.AcceptProposal("bob", "p1");

        result.Outcome.Should().Be(TradeProposalActionOutcome.NotPending);
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().TryRespond(default!, default, default);
        StateSeenBy("bob").Should().Be("Expired");
    }

    [Theory]
    [MemberData(nameof(Actions))]
    public void Should_take_action_when_proposal_was_sent_just_under_7_days_ago(string action)
    {
        var now = SevenDaysAfterSending - OneTick;
        GivenNow(now);

        var result = Act(action);

        result.Outcome.Should().Be(TradeProposalActionOutcome.Done);
        _tradeProposalRepository.Received(1).TryRespond(_proposal, OutcomeOf(action), now);
    }

    [Theory]
    [MemberData(nameof(ActionsOnceExpired))]
    public void Should_refuse_action_when_proposal_has_expired(string action, long ticksAfterDeadline)
    {
        GivenNow(SevenDaysAfterSending + TimeSpan.FromTicks(ticksAfterDeadline));

        var result = Act(action);

        result.Outcome.Should().Be(TradeProposalActionOutcome.NotPending);
        result.MissingCards.Should().BeEmpty();
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().TryRespond(default!, default, default);
    }

    // Expired is worked out when the proposal is read, never written.
    [Fact]
    public void Should_leave_stored_state_pending_when_expired_proposal_is_read_or_acted_on()
    {
        GivenNow(SevenDaysAfterSending + OneTick);

        _handler.GetProposals("bob");
        _handler.AcceptProposal("bob", "p1");

        _proposal.State.Should().Be(TradeProposalState.Pending);
        _proposal.RespondedAt.Should().BeNull();
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().Update(default!);
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().TryRespond(default!, default, default);
    }

    // Only a proposal nobody answered expires: an outcome is final.
    [Theory]
    [MemberData(nameof(FinalStates))]
    public void Should_keep_final_state_when_answered_proposal_was_sent_more_than_7_days_ago(TradeProposalState state)
    {
        _proposal.State = state;
        GivenNow(SevenDaysAfterSending.AddDays(30));

        StateSeenBy("alice").Should().Be(state.ToString());
        StateSeenBy("bob").Should().Be(state.ToString());
    }

    // An expired proposal leaves the pending block for the history, newest first.
    [Fact]
    public void Should_list_expired_proposal_with_the_history_when_get_proposals()
    {
        var now = SevenDaysAfterSending.AddDays(1);
        GivenNow(now);
        var declined = MakeProposal("declined", now.AddDays(-1));
        declined.State = TradeProposalState.Declined;
        GivenProposals(_proposal, declined, MakeProposal("pending", now.AddDays(-2)));

        var response = _handler.GetProposals("alice");

        response.Proposals.Select(proposal => (proposal.Id, proposal.State)).Should().Equal(
            ("pending", "Pending"),
            ("declined", "Declined"),
            ("p1", "Expired")
        );
    }

    // An expired proposal is treated like a declined one: its author can send a new one.
    [Fact]
    public void Should_send_new_proposal_when_previous_one_to_same_recipient_has_expired()
    {
        GivenNow(SevenDaysAfterSending + OneTick);
        _tradeHandler.FindTrades("alice").Returns(
            new TradeableResponse([new UserTradeResponse("bob", "bob", [], [])])
        );

        var sent = _handler.SendProposal("alice", new("bob", [SolRing], [Ragavan]));

        sent.Should().BeTrue();
        _tradeProposalRepository.Received(1).Create(
            Arg.Is<TradeProposal>(proposal => proposal.State == TradeProposalState.Pending)
        );
    }

    private void GivenNow(DateTime now) => _dateTimeService.Now.Returns(now);

    private string StateSeenBy(string userId) =>
        _handler.GetProposals(userId).Proposals.Single(proposal => proposal.Id == "p1").State;

    private TradeProposalActionResult Act(string action) =>
        action switch
        {
            Accept => _handler.AcceptProposal("bob", "p1"),
            Decline => _handler.DeclineProposal("bob", "p1"),
            _ => _handler.WithdrawProposal("alice", "p1"),
        };

    private static TradeProposalState OutcomeOf(string action) =>
        action switch
        {
            Accept => TradeProposalState.Accepted,
            Decline => TradeProposalState.Declined,
            _ => TradeProposalState.Withdrawn,
        };

    private void GivenProposals(params TradeProposal[] proposals)
    {
        _tradeProposalRepository.FindUserProposals("alice").Returns(proposals);
        _tradeProposalRepository.FindUserProposals("bob").Returns(proposals);
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

    private static TradeProposal MakeProposal(string id, DateTime sentAt) =>
        new(id, "alice", "bob", sentAt, TradeProposalState.Pending)
        {
            Cards =
            [
                new(id, SolRing, TradeProposalSide.Proposer),
                new(id, Ragavan, TradeProposalSide.Recipient),
            ]
        };
}
