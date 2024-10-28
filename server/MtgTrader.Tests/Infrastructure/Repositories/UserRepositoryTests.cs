namespace MtgTrader.Tests.Infrastructure.Repositories;

public class UserRepositoryTests
{
    private Mock<ApplicationContext> _dbContextMock;
    private UserRepository _userRepository;

    public UserRepositoryTests()
    {
        _dbContextMock = new Mock<ApplicationContext>(new DbContextOptions<ApplicationContext>());
        _userRepository = new UserRepository(_dbContextMock.Object);
    }

    [Fact]
    public async Task AddAsync_ValidProduct_ReturnsAddedProduct()
    {
        var newUser = new User("idk", "toto", "toto");

        var userDbSetMock = new Mock<DbSet<User>>();

        _dbContextMock.Setup(db => db.Set<User>())
                      .Returns(userDbSetMock.Object);

        userDbSetMock.Setup(dbSet => dbSet.AddAsync(newUser, default))
                        .ReturnsAsync(null as EntityEntry<User>);

        var result = await _userRepository.Create(newUser);

        result.Should().Be(newUser);
    }
}
