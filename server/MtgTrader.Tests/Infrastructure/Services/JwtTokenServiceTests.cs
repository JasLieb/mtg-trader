using MtgTrader.Core.Services;
using MtgTrader.Infrastructure.Configuration;

namespace MtgTrader.Tests.Infrastructure.Services;

public class JwtTokenServiceTests
{
    private readonly IConfiguration _configuration;
    private readonly ITokenService _jwtToken;

    public JwtTokenServiceTests()
    {
        _configuration = Substitute.For<IConfiguration>();
        _jwtToken = new JwtTokenService(_configuration);
    }

    [Fact]
    public void Should_return_false_when_check_invalid_token()
    {
        InitConfiguration();
    
        var result = _jwtToken.CheckToken("nawak");

        result.Should().BeFalse();
    }

    [Fact]
    public void Should_return_true_when_check_valid_token()
    {
        InitConfiguration();
        var validToken = _jwtToken.CreateToken(new User("toto", "toto", "pass"));
    
        var result = _jwtToken.CheckToken(validToken);

        result.Should().BeTrue();
    }

    [Fact]
    public void Should_return_token_when_configuration_is_initialized()
    {
        InitConfiguration();

        var result = _jwtToken.CreateToken(new User("id", "email", "pass"));

        result.Should().NotBeEmpty();
    }

    [Fact]
    public void Should_throw_argument_null_exception_when_configuration_not_initialized()
    {
        var act = () => _jwtToken.CreateToken(new User("id", "email", "pass"));
        act.Should().Throw<ArgumentNullException>();
    }

    private void InitConfiguration()
    {
        _configuration[JwtConstants.Audience].Returns("test");
        _configuration[JwtConstants.Issuer].Returns("test");
        _configuration[JwtConstants.Secret].Returns("testsecrettestsecrettestsecrettestsecrettestsecret");
    }
}
