namespace MtgTrader.Tests.Infrastructure.Repositories;

public class WantlistRepositoryDoublesListTests
{
    private readonly Mock<ApplicationContext> _dbContextMock;
    private readonly IWantlistRepository _wantlistRepository;

    public WantlistRepositoryDoublesListTests()
    {
        _dbContextMock = new Mock<ApplicationContext>(new DbContextOptions<ApplicationContext>());
        _wantlistRepository = new WantlistRepository(_dbContextMock.Object);
    }

    [Fact]
    public void Should_return_users_doubles_list_with_its_cards_when_get_doubles_list()
    {
        var doubles = new Wantlist(DoublesList.IdFor("alice"), "doubles", "alice")
        { Cards = [new(DoublesList.IdFor("alice"), "sol-ring")] };
        GivenWantlists(new Wantlist("alice-wl", "wantlist", "alice"), doubles);

        var actual = _wantlistRepository.GetDoublesList("alice");

        actual.Should().Be(doubles);
        actual!.Cards.Select(card => card.CardId).Should().Equal("sol-ring");
    }

    [Fact]
    public void Should_return_null_when_user_has_no_doubles_list()
    {
        GivenWantlists(new Wantlist(DoublesList.IdFor("bob"), "doubles", "bob"));

        _wantlistRepository.GetDoublesList("alice").Should().BeNull();
    }

    [Fact]
    public void Should_not_return_wantlist_whose_id_contains_double_when_get_doubles_list()
    {
        GivenWantlists(new Wantlist("alice_double", "double trouble", "alice"));

        _wantlistRepository.GetDoublesList("alice").Should().BeNull();
    }

    private void GivenWantlists(params Wantlist[] wantlists)
    {
        _dbContextMock.Setup(db => db.Set<Wantlist>())
            .Returns(wantlists.AsDbSetMock().Object);
    }
}
