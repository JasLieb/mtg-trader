namespace MtgTrader.Tests.Core.Trade;

public class TradeHandlerTests
{
    private readonly IWantlistRepository _wantlistRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITradeHandler _tradeHandler;

    public TradeHandlerTests()
    {
        _wantlistRepository = Substitute.For<IWantlistRepository>();
        _userRepository = Substitute.For<IUserRepository>();
        _tradeHandler = new TradeHandler(_wantlistRepository, _userRepository);
    }

    [Fact]
    public void Should_retrieve_user_wantlists_and_doubles_when_trade()
    {
        _tradeHandler.FindTrades("user");

        _wantlistRepository.Received().GetUserWantlists("user");
    }

    [Fact]
    public void Should_retrieve_wantlists_which_contains_wanted_cards_when_trade()
    {
        var expectedWantlist = new GEntities.Wantlist("id", "name", "ownerId");
        var wantlists = new List<GEntities.Wantlist>()
        {
            expectedWantlist,
            new("id_doubles", "doubles", "ownerId"),
        };
        _wantlistRepository.GetUserWantlists("user").Returns(wantlists);

        _tradeHandler.FindTrades("user");

        _wantlistRepository.Received().FindTradeableDoubles(
            "user",
            Arg.Is<IEnumerable<GEntities.Wantlist>>(wls =>
                wls.Count() == 1 && wls.Contains(expectedWantlist)
            )
        );
    }

    [Fact]
    public void Should_retrieve_tradeable_double_owner_when_trade()
    {
        var userId = "user";
        var userWantlists = new List<GEntities.Wantlist>() { new("id", "name", "ownerId"), new("id_doubles", "name", "ownerId") };
        _wantlistRepository.GetUserWantlists(userId).Returns(userWantlists);
        var tradeableDoubles = new List<GEntities.Wantlist>() { new("id1_doubles", "name2", "owner2Id") };
        _wantlistRepository.FindTradeableDoubles(null, null).ReturnsForAnyArgs(tradeableDoubles);

        _tradeHandler.FindTrades(userId);

        _userRepository.Received().GetByUserId("owner2Id");
    }

    [Fact]
    public void Should_return_tradeable_response_when_trade()
    {
        var userId = "userId";
        var userWantlists = new List<GEntities.Wantlist>() { new("id", "name", "ownerId") };
        _wantlistRepository.GetUserWantlists(userId).Returns(userWantlists);
        var tradeableDouble = new GEntities.Wantlist("id1_doubles", "name2", "owner2Id");
        _wantlistRepository.FindTradeableDoubles(null, null).ReturnsForAnyArgs([tradeableDouble]);
        var expectedUser = new User("owner2Id", "toto", "");
        _userRepository.GetByUserId("owner2Id").Returns(expectedUser);

        var tradeableResponse = _tradeHandler.FindTrades(userId);

        tradeableResponse.Users.Count().Should().Be(1);
        tradeableResponse.Users.ElementAt(0).Should().BeEquivalentTo(
            new UserTradeResponse(
                expectedUser.Id,
                expectedUser.Username,
                [],
                []
            )
        );
    }

    [Fact]
    public void Should_return_only_wanted_cards_when_trade()
    {
        var userId = "userId";
        var userWantlists = new List<GEntities.Wantlist>() {
            new("id", "name", "ownerId")
            {
                Cards = [ new WantlistCards("id", "toto") ]
            }
        };
        _wantlistRepository.GetUserWantlists(userId).Returns(userWantlists);
        var tradeableDouble = new GEntities.Wantlist("id1_doubles", "name2", "owner2Id")
        {
            Cards = 
            [
                new WantlistCards("id1_doubles", "toto"),
                new WantlistCards("id1_doubles", "tata")
            ]
        };
        _wantlistRepository.FindTradeableDoubles(null, null).ReturnsForAnyArgs([tradeableDouble]);
        var expectedUser = new User("owner2Id", "toto", "");
        _userRepository.GetByUserId("owner2Id").Returns(expectedUser);

        var tradeableResponse = _tradeHandler.FindTrades(userId);

        tradeableResponse.Users.ElementAt(0).Doubles.Should().BeEquivalentTo(
            ["toto"]
        );
    }

    [Fact]
    public void Should_return_wanted_doubles_cards_when_trade()
    {
        var searcherId = "userId";
        var tradeableWantlists = new List<GEntities.Wantlist>() {
            new("id", "name", "ownerId"),
            new("id_doubles", "name", "ownerId")
            {
                Cards = [ new WantlistCards("id_doubles", "toto") ]
            }
        };
        _wantlistRepository.GetUserWantlists(searcherId).Returns(tradeableWantlists);
        var searchedWantlists = new GEntities.Wantlist("id1", "name2", "owner2Id")
        {
            Cards = 
            [
                new WantlistCards("id1", "toto")
            ]
        };
        var expectedUser = new User("owner2Id", "toto", "");
        _userRepository.GetByUserId("owner2Id").Returns(expectedUser);
        _wantlistRepository.GetUserWantlists("owner2Id").Returns([searchedWantlists]);
        _wantlistRepository.FindTradeableDoubles(null, null).ReturnsForAnyArgs([searchedWantlists]);

        var tradeableResponse = _tradeHandler.FindTrades(searcherId);

        tradeableResponse.Users.Should().HaveCount(1);
        tradeableResponse.Users.ElementAt(0).Wanted.Should().BeEquivalentTo(
            ["toto"]
        );
    }
    
    [Fact]
    public void Should_return_unique_user_cards_when_trade_through_wantlists()
    {
        var userId = "userId";
        var tradeableDoubles = new List<GEntities.Wantlist>() {
            new("id", "name", "ownerId"),
            new("id_doubles", "name", "ownerId")
            {
                Cards = [ 
                    new WantlistCards("id_doubles", "toto"),
                    new WantlistCards("id_doubles", "tata"),
                ]
            }
        };
        _wantlistRepository.GetUserWantlists(userId).Returns(tradeableDoubles);
        var searchedWantlists = new GEntities.Wantlist[] 
        {
            new ("id1", "name2", "owner2Id")
            {
                Cards = 
                [
                    new WantlistCards("id1", "toto")
                ]
            },
            new ("id2", "name3", "owner2Id")
            {
                Cards = 
                [
                    new WantlistCards("id1", "tata")
                ]
            }
        };
        _wantlistRepository.FindTradeableDoubles(null, null).ReturnsForAnyArgs(searchedWantlists);
        var expectedUser = new User("owner2Id", "toto", "");
        _userRepository.GetByUserId("owner2Id").Returns(expectedUser);
        _wantlistRepository.GetUserWantlists("owner2Id").Returns(searchedWantlists);

        var tradeableResponse = _tradeHandler.FindTrades(userId);

        tradeableResponse.Users.Should().HaveCount(1);
        tradeableResponse.Users.ElementAt(0).Wanted.Should().BeEquivalentTo(
            ["toto", "tata"]
        );
    }
}
