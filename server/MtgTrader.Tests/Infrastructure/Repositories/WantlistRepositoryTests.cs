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
}
