namespace MtgTrader.Tests.Auth;

public class AuthHandlerTests
{
    private AuthHandler _handler;

    public AuthHandlerTests() 
    {
        _handler = new AuthHandler();
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
