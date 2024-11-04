namespace MtgTrader.Tests.Infrastructure.Repositories;

public class WantlistCardsRepositoryTests
{
    private Mock<ApplicationContext> _dbContextMock;
    private IWantlistCardsRepository _wantlistCardsRepository;

    public WantlistCardsRepositoryTests()
    {
        _dbContextMock = new Mock<ApplicationContext>(new DbContextOptions<ApplicationContext>());
        _wantlistCardsRepository = new WantlistCardsRepository(_dbContextMock.Object);
    }

    [Fact]
    public void Should_add_wantlistcard_when_update_and_wantlist_doesnt_contain()
    {
        var wantlistCardsSetMock = Array.Empty<WantlistCards>().AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<WantlistCards>())
            .Returns(wantlistCardsSetMock.Object);

        _wantlistCardsRepository.UpdateWantlist("want", ["conflux"]);

        wantlistCardsSetMock.Verify(m => m.Add(It.IsAny<WantlistCards>()), Times.Once());
        _dbContextMock.Verify(m => m.SaveChanges(), Times.Once());
    }

    [Fact]
    public void Should_do_nothing_when_update_wantlist_and_request_both_contains_card()
    {
        var expectedCardId = "conflux";
        var wantlistId = "want";
        var wantlist = new WantlistCards(wantlistId, expectedCardId);
        var wantlistCardsSetMock = new WantlistCards[] { wantlist }.AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<WantlistCards>())
            .Returns(wantlistCardsSetMock.Object);
        var cards = new string[] { expectedCardId };

        _wantlistCardsRepository.UpdateWantlist("want", ["conflux"]);

        wantlistCardsSetMock.Verify(m => m.Add(It.IsAny<WantlistCards>()), Times.Never());
        wantlistCardsSetMock.Verify(m => m.Remove(It.IsAny<WantlistCards>()), Times.Never());
        _dbContextMock.Verify(m => m.SaveChanges(), Times.Never());
    }

    [Fact]
    public void Should_remove_card_when_update_wantlist_and_request_doesnt_contain_card()
    {
        var expectedCardId = "conflux";
        var wantlistId = "want";
        var wantlist = new WantlistCards(wantlistId, expectedCardId);
        var wantlistCardsSetMock = new WantlistCards[] { wantlist }.AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<WantlistCards>())
            .Returns(wantlistCardsSetMock.Object);

        _wantlistCardsRepository.UpdateWantlist("want", []);

        wantlistCardsSetMock.Verify(m => m.Add(It.IsAny<WantlistCards>()), Times.Never());
        wantlistCardsSetMock.Verify(m => m.Remove(It.IsAny<WantlistCards>()), Times.Once());
        _dbContextMock.Verify(m => m.SaveChanges(), Times.Once());
    }

    [Fact]
    public void Should_return_wantlist_cards_when_get_cards()
    {
        var expectedCardId = "conflux";
        var wantlistId = "want";
        var wantlist = new WantlistCards(wantlistId, expectedCardId);
        var wantlistCardsSetMock = new WantlistCards[] { wantlist }.AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<WantlistCards>())
            .Returns(wantlistCardsSetMock.Object);

        var wantlistCards = _wantlistCardsRepository.GetCards("want");

        wantlistCards.Should().HaveCount(1);
        wantlistCards.ElementAt(0).CardId.Should().Be(expectedCardId);
    }
}
