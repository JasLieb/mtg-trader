using MtgTrader.Core.Services;

namespace MtgTrader.Tests.Core.Auth;

public class AuthHandlerTests
{
    private readonly IUserRepository _userRepository;
    private readonly IWantlistRepository _wantlistRepository;
    private readonly ITokenService _tokenService;
    private readonly IAuthHandler _handler;

    public AuthHandlerTests()
    {
        _userRepository = Substitute.For<IUserRepository>();
        _wantlistRepository = Substitute.For<IWantlistRepository>();
        _tokenService = Substitute.For<ITokenService>();
        _handler = new AuthHandler(_userRepository, _wantlistRepository, _tokenService);
    }

    [Fact]
    public void Should_return_user_when_valid_auth()
    {
        var expectedAuthResponse = new AuthResponse("123");
        var expectedUser = new User("123", "root", "");
        _userRepository.GetByUsername("root").Returns(expectedUser);
        _tokenService.CreateToken(expectedUser).Returns("123");

        var actualAuthResponse = _handler.Connect(new("root", ""));

        actualAuthResponse!.UsrToken.Should().Be(expectedAuthResponse.UsrToken);
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
        var expectedAuthResponse = new AuthResponse("123");
        var expectedUser = new User("123", "root", "");
        _userRepository.Create(null!).ReturnsForAnyArgs(expectedUser);
        _tokenService.CreateToken(expectedUser).Returns("123");
        
        var actualAuthResponse = _handler.CreateUser(new("root", "toto"));

        actualAuthResponse!.UsrToken.Should().Be(expectedAuthResponse.UsrToken);
    }

    [Fact]
    public void Should_create_user_double_when_valid_creation()
    {
        var newUser = new User("123", "root", "toto");
        _userRepository.Create(null!).ReturnsForAnyArgs(newUser);

        _handler.CreateUser(new("root", "toto"));

        _wantlistRepository.Received().Create(
            Arg.Is<GEntities.Wantlist>(
                wl => wl.Id.EndsWith("_doubles")
            )
        );
    }

    [Fact]
    public void Should_return_null_when_invalid_creation()
    {
        var expectedUser = new User("root", "root", "root");
        _userRepository.GetByUsername("root").Returns(expectedUser);

        var result = _handler.CreateUser(new("root", "root"));

        result.Should().BeNull();
    }

    [Fact]
    public void Should_return_true_when_check_valid_token()
    {
        var invalidToken = "valid token";
        
        _tokenService.CheckToken(invalidToken).Returns(true);

        _handler.CheckTokenValidity(invalidToken).Should().NotBeNull();
    }
    
    [Fact]
    public void Should_return_false_when_check_invalid_token()
    {
        var invalidToken = "not valid token";
        
        _tokenService.CheckToken(invalidToken).Returns(false);

        _handler.CheckTokenValidity(invalidToken).Should().BeNull();
    }
}
