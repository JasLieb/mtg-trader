namespace MtgTrader.Tests.Infrastructure.Repositories;

public class WantlistRepositoryUsersWantingCardsTests
{
    private readonly Mock<ApplicationContext> _dbContextMock;
    private readonly IWantlistRepository _wantlistRepository;

    public WantlistRepositoryUsersWantingCardsTests()
    {
        _dbContextMock = new Mock<ApplicationContext>(new DbContextOptions<ApplicationContext>());
        _wantlistRepository = new WantlistRepository(_dbContextMock.Object);
    }

    [Fact]
    public void Should_return_owner_of_wantlist_containing_card_when_find_users_wanting_cards()
    {
        GivenWantlists(MakeWantlist("carol-wl", "carol", "sol-ring"));

        var userIds = _wantlistRepository.FindUserIdsWantingCards("alice", ["sol-ring"]);

        userIds.Should().BeEquivalentTo(["carol"]);
    }

    [Fact]
    public void Should_not_return_owner_of_wantlist_without_given_cards_when_find_users_wanting_cards()
    {
        GivenWantlists(MakeWantlist("carol-wl", "carol", "brainstorm"));

        var userIds = _wantlistRepository.FindUserIdsWantingCards("alice", ["sol-ring"]);

        userIds.Should().BeEmpty();
    }

    [Fact]
    public void Should_not_return_owner_of_doubles_list_containing_card_when_find_users_wanting_cards()
    {
        GivenWantlists(MakeWantlist(DoublesList.IdFor("dave"), "dave", "sol-ring"));

        var userIds = _wantlistRepository.FindUserIdsWantingCards("alice", ["sol-ring"]);

        userIds.Should().BeEmpty();
    }

    [Fact]
    public void Should_not_return_requesting_user_when_find_users_wanting_cards()
    {
        GivenWantlists(MakeWantlist("alice-wl", "alice", "sol-ring"));

        var userIds = _wantlistRepository.FindUserIdsWantingCards("alice", ["sol-ring"]);

        userIds.Should().BeEmpty();
    }

    [Fact]
    public void Should_return_each_owner_once_when_several_wantlists_contain_cards()
    {
        GivenWantlists(
            MakeWantlist("carol-wl1", "carol", "sol-ring"),
            MakeWantlist("carol-wl2", "carol", "counterspell")
        );

        var userIds = _wantlistRepository.FindUserIdsWantingCards("alice", ["sol-ring", "counterspell"]);

        userIds.Should().BeEquivalentTo(["carol"]);
    }

    [Fact]
    public void Should_return_nobody_when_no_card_is_given()
    {
        GivenWantlists(MakeWantlist("carol-wl", "carol", "sol-ring"));

        var userIds = _wantlistRepository.FindUserIdsWantingCards("alice", []);

        userIds.Should().BeEmpty();
    }

    private void GivenWantlists(params Wantlist[] wantlists)
    {
        _dbContextMock.Setup(db => db.Set<Wantlist>())
            .Returns(wantlists.AsDbSetMock().Object);
    }

    private static Wantlist MakeWantlist(string id, string ownerId, string cardId) =>
        new(id, "name", ownerId) { Cards = [new(id, cardId)] };
}
