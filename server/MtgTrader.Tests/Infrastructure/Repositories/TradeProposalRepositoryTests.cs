namespace MtgTrader.Tests.Infrastructure.Repositories;

public class TradeProposalRepositoryTests
{
    private readonly Mock<ApplicationContext> _dbContextMock;
    private readonly ITradeProposalRepository _tradeProposalRepository;

    public TradeProposalRepositoryTests()
    {
        _dbContextMock = new Mock<ApplicationContext>(new DbContextOptions<ApplicationContext>());
        _tradeProposalRepository = new TradeProposalRepository(_dbContextMock.Object);
    }

    [Fact]
    public void Should_return_sent_and_received_proposals_when_find_user_proposals()
    {
        var sent = MakeProposal("sent", "alice", "bob");
        var received = MakeProposal("received", "carol", "alice");
        GivenProposals(sent, received);

        var proposals = _tradeProposalRepository.FindUserProposals("alice");

        proposals.Should().BeEquivalentTo([sent, received]);
    }

    [Fact]
    public void Should_not_return_other_users_proposals_when_find_user_proposals()
    {
        GivenProposals(MakeProposal("other", "bob", "carol"));

        var proposals = _tradeProposalRepository.FindUserProposals("alice");

        proposals.Should().BeEmpty();
    }

    private void GivenProposals(params TradeProposal[] proposals)
    {
        _dbContextMock.Setup(db => db.Set<TradeProposal>())
            .Returns(proposals.AsDbSetMock().Object);
    }

    private static TradeProposal MakeProposal(string id, string proposerId, string recipientId) =>
        new(id, proposerId, recipientId, DateTime.UtcNow, TradeProposalState.Pending)
        {
            Cards = [new(id, "card", TradeProposalSide.Proposer)]
        };
}
