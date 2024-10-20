namespace MtgTrader.Tests.Auth;

public class AuthHandlerTests
{
    private AuthHandler _handler;

    public AuthHandlerTests() 
    {
        _handler = new AuthHandler();
    }

    [Fact]
    public void Should_be_authenticated_when_valid_root()
    {
        _handler.Connect(new("root", "")).Should().BeTrue();
    }
}
