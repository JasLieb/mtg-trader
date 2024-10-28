using MtgTrader.Infrastructure.Configuration;
using NSubstitute.ExceptionExtensions;

namespace MtgTrader.Tests.Infrastructure.Services;

public class JwtTokenServiceTests
{
    private readonly IConfiguration _configuration;
    private readonly IJwtTokenService _jwtToken;

    public JwtTokenServiceTests()
    {
        _configuration = Substitute.For<IConfiguration>();
        _jwtToken = new JwtTokenService(_configuration);
    }

    [Fact]
    public void Should_return_token_when_configuration_is_initialized()
    {
        _configuration[JwtConstants.Audience].Returns("test");
        _configuration[JwtConstants.Issuer].Returns("test");
        _configuration[JwtConstants.Secret].Returns("testsecrettestsecrettestsecrettestsecrettestsecret");

        var result = _jwtToken.CreateToken(new User("id", "email", "pass"));

        result.Should().NotBeEmpty();
    }

    [Fact]
    public void Should_throw_Argument_Null_Exception_when_configuration_not_initialized()
    {
        var act = () => _jwtToken.CreateToken(new User("id", "email", "pass"));
        act.Should().Throw<ArgumentNullException>();
    }
}
