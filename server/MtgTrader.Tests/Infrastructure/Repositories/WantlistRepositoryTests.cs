namespace MtgTrader.Tests.Infrastructure.Repositories;

public class WantlistRepositoryTests
{
    private Mock<ApplicationContext> _dbContextMock;
    private IWantlistRepository _wantlistRepository;

    public WantlistRepositoryTests()
    {
        _dbContextMock = new Mock<ApplicationContext>(new DbContextOptions<ApplicationContext>());
        _wantlistRepository = new WantlistRepository(_dbContextMock.Object);
    }

    [Fact]
    public void Should_return_true_when_wantlist_exists()
    {
        var expectedWantlist = new Wantlist("id", "name", "user");
        var wantlistCardsSetMock = new Wantlist[] { expectedWantlist }.AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<Wantlist>())
            .Returns(wantlistCardsSetMock.Object);

        var exists = _wantlistRepository.IsWantlistExist(expectedWantlist.Id);

        exists.Should().BeTrue();
    }

    [Fact]
    public void Should_return_false_when_wantlist_exists()
    {
        var expectedWantlist = new Wantlist("id", "name", "user");
        var wantlistCardsSetMock = new Wantlist[0].AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<Wantlist>())
            .Returns(wantlistCardsSetMock.Object);

        var exists = _wantlistRepository.IsWantlistExist(expectedWantlist.Id);

        exists.Should().BeFalse();
    }

    [Fact]
    public void Should_return_user_wantlists_when_user_id_found()
    {
        var expectedWantlist = new Wantlist("id", "name", "user");
        var wantlistCardsSetMock = new Wantlist[] { expectedWantlist }.AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<Wantlist>())
            .Returns(wantlistCardsSetMock.Object);

        var actualWantlists = _wantlistRepository.GetUserWantlists("user");

        actualWantlists.Should().Contain(expectedWantlist);
    }

    [Fact]
    public void Should_return_double_wantlists_when_found_tradeable()
    {
        var argumentWantlist = new Wantlist("id", "wantlists", "user")
        { Cards = [new ("id", "card")] };
        var expectedWantlist = new Wantlist("id1_doubles", "doubles", "user1")
        { Cards = [new ("id1_doubles", "card")] };
        var wantlistCardsSetMock = new Wantlist[] { argumentWantlist, expectedWantlist }.AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<Wantlist>())
            .Returns(wantlistCardsSetMock.Object);

        var actualWantlists = _wantlistRepository.FindTradeableDoubles("user", [argumentWantlist]);

        actualWantlists.Should().Contain(expectedWantlist);
    }

    [Fact]
    public void Should_not_return_owner_double_wantlist_when_found_tradeable()
    {
        var argumentWantlist = new Wantlist("id", "wantlists", "user")
        { Cards = [new ("id", "card")] };
        var otherWantlist = new Wantlist("id_doubles", "doubles", "user")
        { Cards = [new ("id_doubles", "card")] };
        var wantlistCardsSetMock = new Wantlist[] { argumentWantlist, otherWantlist }.AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<Wantlist>())
            .Returns(wantlistCardsSetMock.Object);

        var actualWantlists = _wantlistRepository.FindTradeableDoubles("user", [argumentWantlist]);

        actualWantlists.Should().BeEmpty();
    }

    [Fact]
    public void Should_not_return_other_user_wantlist_when_found_tradeable()
    {
        var argumentWantlist = new Wantlist("id", "wantlists", "user")
        { Cards = [new ("id", "card")] };
        var expectedWantlist = new Wantlist("id1", "my_wantlist", "user1")
        { Cards = [new ("id1", "card")] };
        var wantlistCardsSetMock = new Wantlist[] { argumentWantlist, expectedWantlist }.AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<Wantlist>())
            .Returns(wantlistCardsSetMock.Object);

        var actualWantlists = _wantlistRepository.FindTradeableDoubles("user", [argumentWantlist]);

        actualWantlists.Should().BeEmpty();
    }
}
