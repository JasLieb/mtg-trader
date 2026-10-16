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
    public void Should_add_new_user_when_create_valid_user()
    {
        var newUser = new User("idk", "toto", "toto");
        var userDbSetMock = new Mock<DbSet<User>>();
        _dbContextMock.Setup(db => db.Set<User>())
            .Returns(userDbSetMock.Object);

        var result = _userRepository.Create(newUser);

        userDbSetMock.Verify(m => m.Add(It.IsAny<User>()), Times.Once());
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
    public void Should_return_user_when_get_username_with_different_case()
    {
        var users = new List<User> { new("idk", "Toto@Mail.com", "toto") };
        _dbContextMock.Setup(db => db.Set<User>())
            .Returns(users.AsDbSetMock().Object);

        var result = _userRepository.GetByUsername("toto@mail.com");

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

    [Fact]
    public void Should_return_only_requested_users_when_get_userIds()
    {
        var users = new List<User> { new("1", "a", ""), new("2", "b", ""), new("3", "c", "") };
        _dbContextMock.Setup(db => db.Set<User>())
            .Returns(users.AsDbSetMock().Object);

        var result = _userRepository.GetByUserIds(["1", "3"]);

        result.Should().BeEquivalentTo([users[0], users[2]]);
    }

    [Fact]
    public void Should_save_user_and_doubles_together_when_create_with_doubles()
    {
        var newUser = new User("idk", "toto", "toto");
        var doubles = new Wantlist("idk_doubles", "doubles", "idk");
        var userDbSetMock = new Mock<DbSet<User>>();
        var wantlistDbSetMock = new Mock<DbSet<Wantlist>>();
        _dbContextMock.Setup(db => db.Set<User>()).Returns(userDbSetMock.Object);
        _dbContextMock.Setup(db => db.Set<Wantlist>()).Returns(wantlistDbSetMock.Object);

        var result = _userRepository.CreateWithDoubles(newUser, doubles);

        result.Should().Be(newUser);
        userDbSetMock.Verify(m => m.Add(newUser), Times.Once());
        wantlistDbSetMock.Verify(m => m.Add(doubles), Times.Once());
        _dbContextMock.Verify(db => db.SaveChanges(), Times.Once());
    }
}
