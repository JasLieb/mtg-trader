namespace MtgTrader.Tests.Core.Auth;

public class AuthHandlerTests
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthHandler _handler;

    public AuthHandlerTests()
    {
        _userRepository = Substitute.For<IUserRepository>();
        _handler = new AuthHandler(_userRepository);
    }

    [Fact]
    public void Should_return_user_when_valid_auth()
    {
        _userRepository.GetByUsername("root").Returns(new User("123", "root", ""));
        _handler.Connect(new("root", "")).Should().Be(
            new User("123", "root", "")
        );
    }

    [Fact]
    public void Should_return_null_when_invalid_auth()
    {
        _userRepository.GetByUsername("toto").Returns(null as User);
        _handler.Connect(new("toto", "tata")).Should().BeNull();
    }

    [Fact]
    public void Should_return_user_when_valid_creation()
    {
        var newUser = new User("123", "root", "toto");
        _userRepository.Create(null!).ReturnsForAnyArgs(newUser);
    
        var result = _handler.CreateUser(new("root", "toto"));
    
        result.Should().Be(newUser);
    }

    [Fact]
    public void Should_return_null_when_invalid_creation()
    {
        var result = _handler.CreateUser(new("root", "toto"));
    
        result.Should().BeNull();
    }
}
