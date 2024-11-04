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
    public void Should_return_new_user_when_create_valid_user()
    {
        var newUser = new User("idk", "toto", "toto");
        var userDbSetMock = new Mock<DbSet<User>>();
        _dbContextMock.Setup(db => db.Set<User>())
            .Returns(userDbSetMock.Object);

        var result = _userRepository.Create(newUser);

        result.Should().Be(newUser);
        userDbSetMock.Verify(m => m.Add(It.IsAny<User>()), Times.Once());
    }

    [Fact]
    public void Should_return_user_when_get_username_found()
    {
        var users = new List<User> { new("idk", "toto", "toto") };
        var userDbSetMock = users.AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<User>())
            .Returns(userDbSetMock.Object);

        var result = _userRepository.GetByUsername(users[0].Username);

        result.Should().Be(users[0]);
    }
    
    [Fact]
    public void Should_return_user_when_get_userId_found()
    {
        var users = new List<User> { new("idk", "toto", "toto") };
        var userDbSetMock = users.AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<User>())
            .Returns(userDbSetMock.Object);

        var result = _userRepository.GetByUserId(users[0].Id);

        result.Should().Be(users[0]);
    }
}
