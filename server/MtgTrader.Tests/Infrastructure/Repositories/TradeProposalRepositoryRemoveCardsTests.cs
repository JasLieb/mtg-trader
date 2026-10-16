namespace MtgTrader.Tests.Infrastructure.Repositories;

public class TradeProposalRepositoryRemoveCardsTests
{
    private static readonly DateTime RemovedAt = new(2026, 10, 16, 9, 30, 0, DateTimeKind.Utc);

    private readonly Mock<ApplicationContext> _dbContextMock;
    private readonly Mock<DbSet<WantlistCards>> _wantlistCardsMock;
    private readonly ITradeProposalRepository _tradeProposalRepository;
    private readonly List<string> _calls = [];
    private readonly TradeProposal _trade;
    private readonly List<WantlistCards> _listCards =
    [
        new(DoublesList.IdFor("alice"), "thoughtseize"),
        new("alice-wl", "ragavan"),
    ];

    public TradeProposalRepositoryRemoveCardsTests()
    {
        _dbContextMock = new Mock<ApplicationContext>(new DbContextOptions<ApplicationContext>());
        _wantlistCardsMock = Array.Empty<WantlistCards>().AsDbSetMock();
        _wantlistCardsMock.Setup(set => set.RemoveRange(It.IsAny<IEnumerable<WantlistCards>>()))
            .Callback(() => _calls.Add("remove"));
        _dbContextMock.Setup(db => db.Set<WantlistCards>()).Returns(_wantlistCardsMock.Object);
        _tradeProposalRepository = new TradeProposalRepository(_dbContextMock.Object);
        _trade = new("p1", "alice", "bob", RemovedAt.AddDays(-2), TradeProposalState.Accepted);
    }

    [Fact]
    public void Should_stage_every_removal_and_the_mark_then_save_once_when_try_remove_trade_cards()
    {
        DateTime? markWhenSaved = null;
        _dbContextMock.Setup(db => db.SaveChanges()).Returns(() =>
        {
            _calls.Add("save");
            markWhenSaved = _trade.ProposerRemovedCardsAt;
            return 3;
        });

        var written = _tradeProposalRepository.TryRemoveTradeCards(_trade, TradeProposalSide.Proposer, _listCards, RemovedAt);

        written.Should().BeTrue();
        _wantlistCardsMock.Verify(set => set.RemoveRange(_listCards), Times.Once());
        _calls.Should().Equal("remove", "save");
        markWhenSaved.Should().Be(RemovedAt);
        _trade.ProposerRemovedCardsAt.Should().Be(RemovedAt);
        _trade.RecipientRemovedCardsAt.Should().BeNull();
        _dbContextMock.Verify(db => db.SaveChanges(), Times.Once());
    }

    [Fact]
    public void Should_mark_the_recipients_side_when_try_remove_trade_cards_for_the_recipient()
    {
        _dbContextMock.Setup(db => db.SaveChanges()).Returns(1);

        _tradeProposalRepository.TryRemoveTradeCards(_trade, TradeProposalSide.Recipient, [], RemovedAt);

        _trade.RecipientRemovedCardsAt.Should().Be(RemovedAt);
        _trade.ProposerRemovedCardsAt.Should().BeNull();
        _trade.HasRemovedCards("bob").Should().BeTrue();
        _trade.HasRemovedCards("alice").Should().BeFalse();
    }

    [Fact]
    public void Should_save_the_mark_when_try_remove_trade_cards_with_no_card()
    {
        _dbContextMock.Setup(db => db.SaveChanges()).Returns(1);

        var written = _tradeProposalRepository.TryRemoveTradeCards(_trade, TradeProposalSide.Proposer, [], RemovedAt);

        written.Should().BeTrue();
        _trade.HasRemovedCards("alice").Should().BeTrue();
        _dbContextMock.Verify(db => db.SaveChanges(), Times.Once());
    }

    // A concurrent submission of the same step was written first, or one of the rows was already gone:
    // EF rolled the whole save back.
    [Fact]
    public void Should_return_false_and_leave_the_step_undone_when_try_remove_trade_cards_after_a_concurrent_write()
    {
        _dbContextMock.Setup(db => db.SaveChanges())
            .Throws(new DbUpdateConcurrencyException("The mark changed since it was read"));

        var written = _tradeProposalRepository.TryRemoveTradeCards(_trade, TradeProposalSide.Proposer, _listCards, RemovedAt);

        written.Should().BeFalse();
        _trade.HasRemovedCards("alice").Should().BeFalse();
        _dbContextMock.Verify(db => db.SaveChanges(), Times.Once());
    }

    [Fact]
    public void Should_let_any_other_failure_through_when_try_remove_trade_cards_fails_to_save()
    {
        _dbContextMock.Setup(db => db.SaveChanges()).Throws(new DbUpdateException("The database is unreachable"));

        var act = () => _tradeProposalRepository.TryRemoveTradeCards(_trade, TradeProposalSide.Proposer, _listCards, RemovedAt);

        act.Should().Throw<DbUpdateException>();
        _dbContextMock.Verify(db => db.SaveChanges(), Times.Once());
    }

    // What makes the step happen once per User: EF adds both marks read to the UPDATE's WHERE clause,
    // and throws DbUpdateConcurrencyException when no row matches them any more.
    [Fact]
    public void Should_write_a_trades_marks_only_while_they_are_unchanged()
    {
        using var context = new ApplicationContext(
            new DbContextOptionsBuilder<ApplicationContext>().UseNpgsql("Host=unused").Options
        );

        var proposal = context.Model.FindEntityType(typeof(TradeProposal))!;

        proposal.FindProperty(nameof(TradeProposal.ProposerRemovedCardsAt))!.IsConcurrencyToken.Should().BeTrue();
        proposal.FindProperty(nameof(TradeProposal.RecipientRemovedCardsAt))!.IsConcurrencyToken.Should().BeTrue();
    }
}
