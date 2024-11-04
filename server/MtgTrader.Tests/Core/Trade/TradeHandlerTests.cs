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
        var expectedWantlists = new List<GEntities.Wantlist>() {new ("id", "name", "ownerId")};
        _wantlistRepository.GetUserWantlists("user").Returns(expectedWantlists);

        _tradeHandler.FindTrades("user");

        _wantlistRepository.Received().FindTradeableDoubles("user", expectedWantlists);
    }

    [Fact]
    public void Should_retrieve_tradeable_double_owner_when_trade()
    {
        var userId = "user";
        var userWantlists = new List<GEntities.Wantlist>() {new ("id", "name", "ownerId")};
        _wantlistRepository.GetUserWantlists(userId).Returns(userWantlists);
        var tradeableDoubles = new List<GEntities.Wantlist>() {new ("id1_doubles", "name2", "owner2Id")};
        _wantlistRepository.FindTradeableDoubles(userId, userWantlists).Returns(tradeableDoubles);

        _tradeHandler.FindTrades(userId);

        _userRepository.Received().GetByUserId("owner2Id");
    }
    
    [Fact]
    public void Should_return_tradeable_response_when_trade()
    {
        var userId = "userId";
        var userWantlists = new List<GEntities.Wantlist>() {new ("id", "name", "ownerId")};
        _wantlistRepository.GetUserWantlists(userId).Returns(userWantlists);
        var tradeableDoubles = new List<GEntities.Wantlist>() {new ("id1_doubles", "name2", "owner2Id")};
        _wantlistRepository.FindTradeableDoubles(userId, userWantlists).Returns(tradeableDoubles);
        var expectedUser = new User("owner2Id", "toto", "");
        _userRepository.GetByUserId("owner2Id").Returns(expectedUser);

        
        var tradeableResponse = _tradeHandler.FindTrades(userId);

        tradeableResponse.Should().BeEquivalentTo(
            new TradeableResponse(
                [
                    new(
                        expectedUser.Id, 
                        expectedUser.Username,
                        tradeableDoubles.Select(
                            tradeableDouble => new WantlistResponse(
                                tradeableDouble.Id,
                                tradeableDouble.Name,
                                tradeableDouble.Cards.Select(wc => wc.CardId)
                            )
                        )
                    )
                ]
            )
        );
    }
}
