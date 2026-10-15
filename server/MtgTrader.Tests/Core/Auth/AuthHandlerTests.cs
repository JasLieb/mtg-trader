namespace MtgTrader.Tests.Core.Auth;

public class AuthHandlerTests
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IAuthHandler _handler;

    public AuthHandlerTests()
    {
        _userRepository = Substitute.For<IUserRepository>();
        _tokenService = Substitute.For<ITokenService>();
        _passwordHasher = Substitute.For<IPasswordHasher>();
        _passwordHasher.Hash(Arg.Any<string>()).Returns(call => $"hashed:{call.Arg<string>()}");
        _passwordHasher.IsHashed(Arg.Any<string>()).Returns(true);
        _handler = new AuthHandler(_userRepository, _tokenService, _passwordHasher);
    }

    [Fact]
    public void Should_return_user_when_valid_auth()
    {
        var expectedAuthResponse = new AuthResponse("123");
        var expectedUser = new User("123", "root", "hashed:pwd");
        _userRepository.GetByUsername("root").Returns(expectedUser);
        _passwordHasher.Verify("pwd", "hashed:pwd").Returns(true);
        _tokenService.CreateToken(expectedUser).Returns("123");

        var actualAuthResponse = _handler.Connect(new("root", "pwd"));

        actualAuthResponse!.UsrToken.Should().Be(expectedAuthResponse.UsrToken);
    }

    [Fact]
    public void Should_return_null_when_invalid_auth()
    {
        _userRepository.GetByUsername("toto").Returns(null as User);
        _handler.Connect(new("toto", "tata")).Should().BeNull();
    }

    [Fact]
    public void Should_return_null_when_wrong_password()
    {
        _userRepository.GetByUsername("root").Returns(new User("123", "root", "hashed:pwd"));
        _passwordHasher.Verify("wrong", "hashed:pwd").Returns(false);

        _handler.Connect(new("root", "wrong")).Should().BeNull();
    }

    [Fact]
    public void Should_look_up_normalized_email_when_auth()
    {
        _handler.Connect(new("  Root@Mail.com ", "pwd"));

        _userRepository.Received().GetByUsername("root@mail.com");
    }

    [Fact]
    public void Should_hash_plain_text_password_when_valid_auth_with_legacy_account()
    {
        var legacyUser = new User("123", "root", "pwd");
        _userRepository.GetByUsername("root").Returns(legacyUser);
        _passwordHasher.Verify("pwd", "pwd").Returns(true);
        _passwordHasher.IsHashed("pwd").Returns(false);

        _handler.Connect(new("root", "pwd"));

        _userRepository.Received().Update(
            Arg.Is<User>(user => user.Id == "123" && user.Password == "hashed:pwd")
        );
    }

    [Fact]
    public void Should_return_user_when_valid_creation()
    {
        var expectedAuthResponse = new AuthResponse("123");
        var expectedUser = new User("123", "root", "hashed:toto");
        _userRepository.CreateWithDoubles(default!, default!).ReturnsForAnyArgs(expectedUser);
        _tokenService.CreateToken(expectedUser).Returns("123");

        var actualAuthResponse = _handler.CreateUser(new("root", "toto"));

        actualAuthResponse!.UsrToken.Should().Be(expectedAuthResponse.UsrToken);
    }

    [Fact]
    public void Should_create_user_with_hashed_password_and_doubles_when_valid_creation()
    {
        _handler.CreateUser(new("Root@Mail.com", "toto"));

        _userRepository.Received().CreateWithDoubles(
            Arg.Is<User>(user => user.Username == "root@mail.com" && user.Password == "hashed:toto"),
            Arg.Is<GEntities.Wantlist>(wl => wl.Id.EndsWith("_doubles"))
        );
    }

    [Fact]
    public void Should_return_null_when_invalid_creation()
    {
        var expectedUser = new User("root", "root", "root");
        _userRepository.GetByUsername("root").Returns(expectedUser);

        var result = _handler.CreateUser(new("root", "root"));

        result.Should().BeNull();
        _userRepository.DidNotReceiveWithAnyArgs().CreateWithDoubles(default!, default!);
    }

    [Fact]
    public void Should_return_null_when_creation_loses_race_on_username()
    {
        _userRepository.CreateWithDoubles(default!, default!).ReturnsForAnyArgs(null as User);

        _handler.CreateUser(new("root", "toto")).Should().BeNull();
    }

    [Fact]
    public void Should_return_true_when_check_valid_token()
    {
        var invalidToken = "valid token";

        _tokenService.CheckToken(invalidToken).Returns("token");

        _handler.CheckTokenValidity(invalidToken).Should().NotBeNull();
    }

    [Fact]
    public void Should_return_false_when_check_invalid_token()
    {
        var invalidToken = "not valid token";

        _tokenService.CheckToken(invalidToken).ReturnsNull();

        _handler.CheckTokenValidity(invalidToken).Should().BeNull();
    }
}
