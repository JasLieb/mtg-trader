namespace MtgTrader.Tests.Core.Auth;

public class AuthHandlerTests
{
    private IAuthHandler _handler;

    public AuthHandlerTests()
    {
        var userRepository = Substitute.For<IUserRepository>();
        _handler = new AuthHandler(userRepository);
    }

    [Fact]
    public void Should_return_user_when_valid_auth()
    {
        _handler.Connect(new("root", "")).Should().Be(
            new User("123", "root", "")
        );
    }

    [Fact]
    public void Should_return_null_when_invalid_auth()
    {
        _handler.Connect(new("toto", "tata")).Should().BeNull();
    }
}
