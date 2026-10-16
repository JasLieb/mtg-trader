using MtgTrader.Core.Handlers.TradeProposals;
using NSubstitute.Extensions;

namespace MtgTrader.Tests.Core.TradeProposals;

// "Remove these cards from my lists", on the Trade of scenarios 1 and 9 of the spec: Alice gives her
// Sol Ring and Thoughtseize to Bob for his Ragavan, and Bob has accepted.
public class TradeProposalHandlerRemoveCardsTests
{
    private const string Ragavan = "ragavan-mh2";
    private const string LightningBolt = "lightning-bolt-m10";
    private const string SolRing = "sol-ring-c21";
    private const string Counterspell = "counterspell-mh2";
    private const string Thoughtseize = "thoughtseize-ths";
    private const string Brainstorm = "brainstorm-ema";

    private static readonly DateTime Now = new(2026, 10, 16, 9, 30, 0, DateTimeKind.Utc);

    private readonly ITradeProposalRepository _tradeProposalRepository;
    private readonly IWantlistRepository _wantlistRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITradeProposalHandler _handler;
    private readonly TradeProposal _trade;
    private List<(string WantlistId, string CardId)> _removed = [];

    public TradeProposalHandlerRemoveCardsTests()
    {
        _tradeProposalRepository = Substitute.For<ITradeProposalRepository>();
        _wantlistRepository = Substitute.For<IWantlistRepository>();
        _userRepository = Substitute.For<IUserRepository>();
        var dateTimeService = Substitute.For<IDateTimeService>();
        dateTimeService.Now.Returns(Now);
        _handler = new TradeProposalHandler(
            _tradeProposalRepository,
            _wantlistRepository,
            _userRepository,
            Substitute.For<ITradeHandler>(),
            dateTimeService
        );

        // Ragavan is in two of Alice's Wantlists, to show a received Card leaves every one of them.
        GivenLists("alice", [SolRing, Counterspell, Thoughtseize], ("alice-modern", [Ragavan, LightningBolt]), ("alice-cube", [Ragavan]));
        GivenLists("bob", [Ragavan, Brainstorm], ("bob-edh", [SolRing]));
        _trade = new("p1", "alice", "bob", Now.AddDays(-2), TradeProposalState.Accepted)
        {
            RespondedAt = Now.AddDays(-1),
            Cards =
            [
                new("p1", SolRing, TradeProposalSide.Proposer),
                new("p1", Thoughtseize, TradeProposalSide.Proposer),
                new("p1", Ragavan, TradeProposalSide.Recipient),
            ]
        };
        _tradeProposalRepository.FindProposal("p1").Returns(_trade);
        // Like the real repository, a successful write leaves the step marked done for that side.
        _tradeProposalRepository.TryRemoveTradeCards(default!, default, default!, default).ReturnsForAnyArgs(call =>
        {
            _removed = [.. call.Arg<IEnumerable<WantlistCards>>().Select(card => (card.WantlistId, card.CardId))];
            if (call.Arg<TradeProposalSide>() == TradeProposalSide.Proposer)
                call.Arg<TradeProposal>().ProposerRemovedCardsAt = call.Arg<DateTime>();
            else
                call.Arg<TradeProposal>().RecipientRemovedCardsAt = call.Arg<DateTime>();
            return true;
        });
        _userRepository.GetByUserIds(default!).ReturnsForAnyArgs(
            [new User("alice", "alice@mail", ""), new User("bob", "bob@mail", "")]
        );
    }

    public static TheoryData<TradeProposalState> StatesOtherThanAccepted => new()
    {
        TradeProposalState.Pending,
        TradeProposalState.Declined,
        TradeProposalState.Withdrawn,
    };

    // Scenario 10 of the spec.
    [Fact]
    public void Should_remove_thoughtseize_and_ragavan_but_keep_sol_ring_when_alice_unchecks_sol_ring()
    {
        var outcome = _handler.RemoveTradeCards("alice", "p1", new([Thoughtseize], [Ragavan]));

        outcome.Should().Be(TradeCardsRemovalOutcome.Done);
        _removed.Should().BeEquivalentTo(
            [(DoublesList.IdFor("alice"), Thoughtseize), ("alice-modern", Ragavan), ("alice-cube", Ragavan)]
        );
        _tradeProposalRepository.Received(1).TryRemoveTradeCards(
            _trade, TradeProposalSide.Proposer, Arg.Any<IEnumerable<WantlistCards>>(), Now
        );
        // Bob's lists are not even read.
        _wantlistRepository.DidNotReceive().GetUserWantlists("bob");
        _wantlistRepository.DidNotReceive().GetDoublesList("bob");
    }

    // Scenario 10 of the spec: the button disappears for Alice, not for Bob.
    [Fact]
    public void Should_show_the_step_as_done_only_to_the_user_who_did_it()
    {
        _handler.RemoveTradeCards("alice", "p1", new([Thoughtseize], [Ragavan]));
        _tradeProposalRepository.FindUserProposals(default!).ReturnsForAnyArgs([_trade]);

        _handler.GetProposals("alice").Proposals.Should().ContainSingle().Which.HasRemovedCards.Should().BeTrue();
        _handler.GetProposals("bob").Proposals.Should().ContainSingle().Which.HasRemovedCards.Should().BeFalse();
    }

    [Fact]
    public void Should_show_the_step_as_not_done_when_get_proposals_before_it()
    {
        _tradeProposalRepository.FindUserProposals(default!).ReturnsForAnyArgs([_trade]);

        _handler.GetProposals("alice").Proposals.Should().ContainSingle().Which.HasRemovedCards.Should().BeFalse();
    }

    [Fact]
    public void Should_remove_every_card_of_the_trade_when_every_card_stays_checked()
    {
        var outcome = _handler.RemoveTradeCards("alice", "p1", new([SolRing, Thoughtseize], [Ragavan]));

        outcome.Should().Be(TradeCardsRemovalOutcome.Done);
        _removed.Should().BeEquivalentTo(
            [
                (DoublesList.IdFor("alice"), SolRing),
                (DoublesList.IdFor("alice"), Thoughtseize),
                ("alice-modern", Ragavan),
                ("alice-cube", Ragavan),
            ]
        );
    }

    [Fact]
    public void Should_mark_the_step_done_and_remove_nothing_when_nothing_is_checked()
    {
        var outcome = _handler.RemoveTradeCards("alice", "p1", new([], []));

        outcome.Should().Be(TradeCardsRemovalOutcome.Done);
        _removed.Should().BeEmpty();
        _tradeProposalRepository.Received(1).TryRemoveTradeCards(
            _trade, TradeProposalSide.Proposer, Arg.Is<IEnumerable<WantlistCards>>(cards => !cards.Any()), Now
        );
        _trade.HasRemovedCards("alice").Should().BeTrue();
    }

    // The Doubles list is not a Wantlist: receiving one more copy leaves my spare copies as they were.
    [Fact]
    public void Should_keep_a_received_card_in_my_doubles_list_when_removing_it_from_my_wantlists()
    {
        GivenLists("alice", [SolRing, Thoughtseize, Ragavan], ("alice-modern", [Ragavan]));

        _handler.RemoveTradeCards("alice", "p1", new([], [Ragavan]));

        _removed.Should().BeEquivalentTo([("alice-modern", Ragavan)]);
    }

    [Fact]
    public void Should_keep_a_given_card_in_my_wantlists_when_removing_it_from_my_doubles_list()
    {
        GivenLists("alice", [SolRing, Thoughtseize], ("alice-modern", [Thoughtseize]));

        _handler.RemoveTradeCards("alice", "p1", new([Thoughtseize], []));

        _removed.Should().BeEquivalentTo([(DoublesList.IdFor("alice"), Thoughtseize)]);
    }

    [Fact]
    public void Should_remove_cards_from_the_recipients_own_lists_when_the_recipient_does_the_step()
    {
        var outcome = _handler.RemoveTradeCards("bob", "p1", new([Ragavan], [SolRing, Thoughtseize]));

        outcome.Should().Be(TradeCardsRemovalOutcome.Done);
        _removed.Should().BeEquivalentTo([(DoublesList.IdFor("bob"), Ragavan), ("bob-edh", SolRing)]);
        _tradeProposalRepository.Received(1).TryRemoveTradeCards(
            _trade, TradeProposalSide.Recipient, Arg.Any<IEnumerable<WantlistCards>>(), Now
        );
        _wantlistRepository.DidNotReceive().GetUserWantlists("alice");
    }

    [Fact]
    public void Should_let_the_other_user_do_the_step_when_one_user_has_done_it()
    {
        _handler.RemoveTradeCards("alice", "p1", new([Thoughtseize], [Ragavan]));

        var outcome = _handler.RemoveTradeCards("bob", "p1", new([Ragavan], [SolRing]));

        outcome.Should().Be(TradeCardsRemovalOutcome.Done);
        _trade.HasRemovedCards("alice").Should().BeTrue();
        _trade.HasRemovedCards("bob").Should().BeTrue();
    }

    [Fact]
    public void Should_remove_the_cards_and_mark_the_step_in_a_single_write()
    {
        _handler.RemoveTradeCards("alice", "p1", new([SolRing, Thoughtseize], [Ragavan]));

        _tradeProposalRepository.ReceivedWithAnyArgs(1).TryRemoveTradeCards(default!, default, default!, default);
        _wantlistRepository.DidNotReceiveWithAnyArgs().Delete(default!);
        _wantlistRepository.DidNotReceiveWithAnyArgs().Update(default!);
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().Update(default!);
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().TryRespond(default!, default, default);
    }

    // The single write failed, for instance because a concurrent submission of the step was written first.
    [Fact]
    public void Should_report_a_conflict_and_leave_the_step_undone_when_the_write_fails()
    {
        _tradeProposalRepository.Configure().TryRemoveTradeCards(default!, default, default!, default).ReturnsForAnyArgs(false);

        var outcome = _handler.RemoveTradeCards("alice", "p1", new([Thoughtseize], [Ragavan]));

        outcome.Should().Be(TradeCardsRemovalOutcome.Conflict);
        _trade.HasRemovedCards("alice").Should().BeFalse();
        _wantlistRepository.DidNotReceiveWithAnyArgs().Delete(default!);
        _wantlistRepository.DidNotReceiveWithAnyArgs().Update(default!);
    }

    [Fact]
    public void Should_refuse_the_step_when_it_is_submitted_a_second_time()
    {
        _handler.RemoveTradeCards("alice", "p1", new([Thoughtseize], [Ragavan]));
        _tradeProposalRepository.ClearReceivedCalls();

        ShouldRefuse(
            _handler.RemoveTradeCards("alice", "p1", new([SolRing], [])),
            TradeCardsRemovalOutcome.AlreadyDone
        );
    }

    [Fact]
    public void Should_refuse_the_step_when_the_user_has_already_done_it()
    {
        _trade.RecipientRemovedCardsAt = Now.AddHours(-1);

        ShouldRefuse(_handler.RemoveTradeCards("bob", "p1", new([], [])), TradeCardsRemovalOutcome.AlreadyDone);
    }

    [Theory]
    [MemberData(nameof(StatesOtherThanAccepted))]
    public void Should_refuse_the_step_when_the_proposal_is_not_an_accepted_trade(TradeProposalState state)
    {
        _trade.State = state;

        ShouldRefuse(_handler.RemoveTradeCards("alice", "p1", new([], [])), TradeCardsRemovalOutcome.NotATrade);
    }

    [Fact]
    public void Should_refuse_the_step_when_the_user_is_neither_proposer_nor_recipient()
    {
        ShouldRefuse(_handler.RemoveTradeCards("carol", "p1", new([], [])), TradeCardsRemovalOutcome.NotFound);
    }

    [Fact]
    public void Should_refuse_the_step_when_the_proposal_does_not_exist()
    {
        ShouldRefuse(_handler.RemoveTradeCards("alice", "unknown", new([], [])), TradeCardsRemovalOutcome.NotFound);
    }

    // Counterspell is in Alice's Doubles list but not in the Trade.
    [Fact]
    public void Should_refuse_the_step_when_a_card_is_not_part_of_the_trade()
    {
        ShouldRefuse(
            _handler.RemoveTradeCards("alice", "p1", new([Thoughtseize, Counterspell], [Ragavan])),
            TradeCardsRemovalOutcome.NotTradeCards
        );
    }

    [Fact]
    public void Should_refuse_the_step_when_a_card_i_receive_is_sent_as_one_i_give()
    {
        ShouldRefuse(
            _handler.RemoveTradeCards("alice", "p1", new([Ragavan], [])),
            TradeCardsRemovalOutcome.NotTradeCards
        );
    }

    [Fact]
    public void Should_refuse_the_step_when_a_card_i_give_is_sent_as_one_i_receive()
    {
        ShouldRefuse(
            _handler.RemoveTradeCards("alice", "p1", new([], [SolRing])),
            TradeCardsRemovalOutcome.NotTradeCards
        );
    }

    private void ShouldRefuse(TradeCardsRemovalOutcome outcome, TradeCardsRemovalOutcome expected)
    {
        outcome.Should().Be(expected);
        _tradeProposalRepository.DidNotReceiveWithAnyArgs().TryRemoveTradeCards(default!, default, default!, default);
        _wantlistRepository.DidNotReceiveWithAnyArgs().Delete(default!);
    }

    // Every list of the user, their Doubles list included, as WantlistRepository.GetUserWantlists returns them.
    private void GivenLists(string userId, string[] doubles, params (string Id, string[] Cards)[] wantlists)
    {
        _wantlistRepository.GetUserWantlists(userId).Returns(
            [
                MakeList(DoublesList.IdFor(userId), userId, doubles),
                .. wantlists.Select(wantlist => MakeList(wantlist.Id, userId, wantlist.Cards)),
            ]
        );
    }

    private static GEntities.Wantlist MakeList(string id, string ownerId, string[] cardIds) =>
        new(id, id, ownerId) { Cards = [.. cardIds.Select(card => new WantlistCards(id, card))] };
}
