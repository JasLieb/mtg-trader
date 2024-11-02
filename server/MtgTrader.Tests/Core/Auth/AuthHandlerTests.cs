namespace MtgTrader.Tests.Core.Auth;

public class AuthHandlerTests
{
    private readonly IUserRepository _userRepository;
    private readonly IWantlistRepository _wantlistRepository;
    private readonly IAuthHandler _handler;

    public AuthHandlerTests()
    {
        _userRepository = Substitute.For<IUserRepository>();
        _wantlistRepository = Substitute.For<IWantlistRepository>();
        _handler = new AuthHandler(_userRepository, _wantlistRepository);
    }

    [Fact]
    public void Should_return_user_when_valid_auth()
    {
        var expectedUser = new GEntities.User("123", "root", "");
        _userRepository.GetByUsername("root").Returns(expectedUser);
        _handler.Connect(new("root", "")).Should().Be(expectedUser);
    }

    [Fact]
    public void Should_return_null_when_invalid_auth()
    {
        _userRepository.GetByUsername("toto").Returns(null as  GEntities.User);
        _handler.Connect(new("toto", "tata")).Should().BeNull();
    }

    [Fact]
    public void Should_return_user_when_valid_creation()
    {
        var newUser = new  GEntities.User("123", "root", "toto");
        _userRepository.Create(null!).ReturnsForAnyArgs(newUser);
    
        var result = _handler.CreateUser(new("root", "toto"));
    
        result.Should().Be(newUser);
    }
    
    [Fact]
    public void Should_create_user_double_when_valid_creation()
    {
        var newUser = new  GEntities.User("123", "root", "toto");
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
        var result = _handler.CreateUser(new("root", "toto"));
    
        result.Should().BeNull();
    }
}
