namespace MtgTrader.Tests.Infrastructure.Repositories;

public class TradeProposalRepositoryRespondTests
{
    private static readonly DateTime RespondedAt = new(2026, 10, 16, 9, 30, 0, DateTimeKind.Utc);

    private readonly Mock<ApplicationContext> _dbContextMock;
    private readonly ITradeProposalRepository _tradeProposalRepository;

    public TradeProposalRepositoryRespondTests()
    {
        _dbContextMock = new Mock<ApplicationContext>(new DbContextOptions<ApplicationContext>());
        _tradeProposalRepository = new TradeProposalRepository(_dbContextMock.Object);
    }

    [Fact]
    public void Should_return_proposal_with_its_cards_when_find_proposal()
    {
        var wanted = MakeProposal("wanted");
        GivenProposals(MakeProposal("other"), wanted);

        var proposal = _tradeProposalRepository.FindProposal("wanted");

        proposal.Should().BeSameAs(wanted);
        proposal!.Cards.Should().ContainSingle();
    }

    [Fact]
    public void Should_return_null_when_find_proposal_with_unknown_id()
    {
        GivenProposals(MakeProposal("other"));

        _tradeProposalRepository.FindProposal("unknown").Should().BeNull();
    }

    [Fact]
    public void Should_write_outcome_and_response_date_when_try_respond()
    {
        var proposal = MakeProposal("p1");
        _dbContextMock.Setup(db => db.SaveChanges()).Returns(1);

        var written = _tradeProposalRepository.TryRespond(proposal, TradeProposalState.Accepted, RespondedAt);

        written.Should().BeTrue();
        proposal.State.Should().Be(TradeProposalState.Accepted);
        proposal.RespondedAt.Should().Be(RespondedAt);
        _dbContextMock.Verify(db => db.SaveChanges(), Times.Once());
    }

    [Fact]
    public void Should_return_false_when_try_respond_after_another_action_changed_the_state()
    {
        _dbContextMock.Setup(db => db.SaveChanges())
            .Throws(new DbUpdateConcurrencyException("State changed since it was read"));

        var written = _tradeProposalRepository.TryRespond(MakeProposal("p1"), TradeProposalState.Accepted, RespondedAt);

        written.Should().BeFalse();
    }

    [Fact]
    public void Should_return_false_when_try_respond_writes_nothing()
    {
        _dbContextMock.Setup(db => db.SaveChanges()).Returns(0);

        var written = _tradeProposalRepository.TryRespond(MakeProposal("p1"), TradeProposalState.Declined, RespondedAt);

        written.Should().BeFalse();
    }

    // What makes TryRespond conditional: EF adds the State read to the UPDATE's WHERE clause,
    // and throws DbUpdateConcurrencyException when no row matches it any more.
    [Fact]
    public void Should_write_a_proposal_only_while_its_state_is_unchanged()
    {
        using var context = new ApplicationContext(
            new DbContextOptionsBuilder<ApplicationContext>().UseNpgsql("Host=unused").Options
        );

        var state = context.Model.FindEntityType(typeof(TradeProposal))!.FindProperty(nameof(TradeProposal.State))!;

        state.IsConcurrencyToken.Should().BeTrue();
    }

    private void GivenProposals(params TradeProposal[] proposals)
    {
        _dbContextMock.Setup(db => db.Set<TradeProposal>())
            .Returns(proposals.AsDbSetMock().Object);
    }

    private static TradeProposal MakeProposal(string id) =>
        new(id, "alice", "bob", RespondedAt.AddDays(-1), TradeProposalState.Pending)
        {
            Cards = [new(id, "card", TradeProposalSide.Proposer)]
        };
}
