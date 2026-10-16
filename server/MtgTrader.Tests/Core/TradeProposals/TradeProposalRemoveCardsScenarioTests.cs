using MtgTrader.Core.Handlers.TradeProposals;

namespace MtgTrader.Tests.Core.TradeProposals;

// Scenario 10 of the spec from the handler down to the context: the real handlers and repositories,
// over a faked ApplicationContext whose SaveChanges applies the staged removals all at once, the way the
// database applies one SaveChanges in one transaction, or applies none of them when it fails.
// Starts from the lists of the spec and the Trade of scenarios 1 and 9: Alice gives her Sol Ring and
// Thoughtseize to Bob for his Ragavan, and Bob has accepted.
public class TradeProposalRemoveCardsScenarioTests
{
    private const string Ragavan = "ragavan-mh2";
    private const string LightningBolt = "lightning-bolt-m10";
    private const string SolRing = "sol-ring-c21";
    private const string Counterspell = "counterspell-mh2";
    private const string Thoughtseize = "thoughtseize-ths";
    private const string Brainstorm = "brainstorm-ema";

    private static readonly DateTime Now = new(2026, 10, 16, 9, 30, 0, DateTimeKind.Utc);

    private readonly Mock<ApplicationContext> _dbContextMock;
    private readonly List<GEntities.Wantlist> _lists;
    private readonly List<WantlistCards> _staged = [];
    private readonly TradeProposal _trade;
    private readonly ITradeProposalHandler _tradeProposalHandler;
    private readonly IWantlistHandler _wantlistHandler;

    public TradeProposalRemoveCardsScenarioTests()
    {
        _dbContextMock = new Mock<ApplicationContext>(new DbContextOptions<ApplicationContext>());
        _lists =
        [
            MakeList(DoublesList.IdFor("alice"), "alice", SolRing, Counterspell, Thoughtseize),
            MakeList("alice-wl", "alice", Ragavan, LightningBolt),
            MakeList("alice-cube", "alice", Ragavan),
            MakeList(DoublesList.IdFor("bob"), "bob", Ragavan, Brainstorm),
            MakeList("bob-wl", "bob", SolRing),
            MakeList(DoublesList.IdFor("carol"), "carol", Brainstorm),
            MakeList("carol-wl", "carol", SolRing),
        ];
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
        _dbContextMock.Setup(db => db.Set<GEntities.Wantlist>()).Returns(_lists.AsDbSetMock().Object);
        _dbContextMock.Setup(db => db.Set<TradeProposal>()).Returns(new[] { _trade }.AsDbSetMock().Object);
        _dbContextMock.Setup(db => db.Set<User>()).Returns(
            new[] { new User("alice", "alice@mail", ""), new User("bob", "bob@mail", "") }.AsDbSetMock().Object
        );
        var wantlistCards = Array.Empty<WantlistCards>().AsDbSetMock();
        wantlistCards.Setup(set => set.RemoveRange(It.IsAny<IEnumerable<WantlistCards>>()))
            .Callback<IEnumerable<WantlistCards>>(_staged.AddRange);
        _dbContextMock.Setup(db => db.Set<WantlistCards>()).Returns(wantlistCards.Object);
        _dbContextMock.Setup(db => db.SaveChanges()).Returns(() => ApplyStagedRemovals());

        var dateTimeService = Substitute.For<IDateTimeService>();
        dateTimeService.Now.Returns(Now);
        var context = _dbContextMock.Object;
        _tradeProposalHandler = new TradeProposalHandler(
            new TradeProposalRepository(context),
            new WantlistRepository(context),
            new UserRepository(context),
            Substitute.For<ITradeHandler>(),
            dateTimeService
        );
        _wantlistHandler = new WantlistHandler(new WantlistRepository(context), new WantlistCardsRepository(context));
    }

    [Fact]
    public void Should_remove_thoughtseize_and_ragavan_from_alices_lists_only_when_she_unchecks_sol_ring()
    {
        var outcome = _tradeProposalHandler.RemoveTradeCards("alice", "p1", new([Thoughtseize], [Ragavan]));

        outcome.Should().Be(TradeCardsRemovalOutcome.Done);
        ListsOf("alice").Should().BeEquivalentTo(
            new Dictionary<string, string[]>
            {
                [DoublesList.IdFor("alice")] = [SolRing, Counterspell],
                ["alice-wl"] = [LightningBolt],
                ["alice-cube"] = [],
            }
        );
        ListsOf("bob").Should().BeEquivalentTo(
            new Dictionary<string, string[]>
            {
                [DoublesList.IdFor("bob")] = [Ragavan, Brainstorm],
                ["bob-wl"] = [SolRing],
            }
        );
        // The button disappears for Alice; Bob still has his step to do.
        ProposalOf("alice").HasRemovedCards.Should().BeTrue();
        ProposalOf("bob").HasRemovedCards.Should().BeFalse();
        _dbContextMock.Verify(db => db.SaveChanges(), Times.Once());
    }

    [Fact]
    public void Should_modify_no_list_when_the_write_of_the_step_fails()
    {
        _dbContextMock.Setup(db => db.SaveChanges())
            .Throws(new DbUpdateConcurrencyException("The step was written by another submission"));

        var outcome = _tradeProposalHandler.RemoveTradeCards("alice", "p1", new([SolRing, Thoughtseize], [Ragavan]));

        outcome.Should().Be(TradeCardsRemovalOutcome.Conflict);
        ListsOf("alice").Should().BeEquivalentTo(
            new Dictionary<string, string[]>
            {
                [DoublesList.IdFor("alice")] = [SolRing, Counterspell, Thoughtseize],
                ["alice-wl"] = [Ragavan, LightningBolt],
                ["alice-cube"] = [Ragavan],
            }
        );
        ProposalOf("alice").HasRemovedCards.Should().BeFalse();
    }

    [Fact]
    public void Should_refuse_a_second_submission_of_the_step_without_writing_again()
    {
        _tradeProposalHandler.RemoveTradeCards("alice", "p1", new([Thoughtseize], []));

        var outcome = _tradeProposalHandler.RemoveTradeCards("alice", "p1", new([SolRing], [Ragavan]));

        outcome.Should().Be(TradeCardsRemovalOutcome.AlreadyDone);
        ListsOf("alice")[DoublesList.IdFor("alice")].Should().Equal(SolRing, Counterspell);
        ListsOf("alice")["alice-wl"].Should().Equal(Ragavan, LightningBolt);
        _dbContextMock.Verify(db => db.SaveChanges(), Times.Once());
    }

    // What the database does with one SaveChanges: every staged row goes, or none does.
    private int ApplyStagedRemovals()
    {
        foreach (var list in _lists)
            foreach (var card in _staged)
                list.Cards.Remove(card);
        var written = _staged.Count + 1;
        _staged.Clear();
        return written;
    }

    private Dictionary<string, string[]> ListsOf(string userId) =>
        _wantlistHandler.GetWantlists(userId).Wantlists
            .ToDictionary(list => list.Id, list => list.Cards.ToArray());

    private TradeProposalResponse ProposalOf(string userId) =>
        _tradeProposalHandler.GetProposals(userId).Proposals.Should().ContainSingle().Which;

    private static GEntities.Wantlist MakeList(string id, string ownerId, params string[] cardIds) =>
        new(id, id, ownerId) { Cards = [.. cardIds.Select(card => new WantlistCards(id, card))] };
}
