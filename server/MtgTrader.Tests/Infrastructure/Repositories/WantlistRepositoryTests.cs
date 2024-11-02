using MtgTrader.Core.Entities.General;

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
}
