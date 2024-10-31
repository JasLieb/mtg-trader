namespace MtgTrader.Tests.Core.Wantlist;

public class WantlistHandlerTests
{
    private readonly IWantlistRepository _wantlistRepository;
    private readonly IWantlistCardsRepository _wantlistCardsRepository;
    private readonly IWantlistHandler _handler;

    public WantlistHandlerTests()
    {
        _wantlistRepository = Substitute.For<IWantlistRepository>();
        _wantlistCardsRepository = Substitute.For<IWantlistCardsRepository>();
        _handler = new WantlistHandler(_wantlistRepository, _wantlistCardsRepository);
    }

    [Fact]
    public void Should_return_formatted_wantlist_when_get_user_wantlists()
    {
        _wantlistRepository.GetUserWantlists("user").Returns(
            [
                new GEntities.Wantlist("test", "name", "user")
                {
                    Cards = [new GEntities.WantlistCards("test", "card")]
                }
            ]
        );
        
        var wantlists = _handler.GetWantlists("user");
    
        wantlists.First().Should().BeEquivalentTo(
            new BResEntities.FormattedWantlistResponse(
                "test", "name", ["card"]
            )            
        );
    }

    [Fact]
    public void Should_return_new_wantlist_when_is_created()
    {
        var expectedWantlist = new GEntities.Wantlist("id", "new", "user");
        _wantlistRepository.Create(Arg.Any<GEntities.Wantlist>()).Returns(expectedWantlist);
        
        var actualWantlist = _handler.CreateWantlist(
            new BReqREntities.CreateWantlistRequest("new"),
            "user"
        );
    
        _wantlistRepository.Received().Create(Arg.Any<GEntities.Wantlist>());
        actualWantlist.Name.Should().Be("new");
        actualWantlist.OwnerId.Should().Be("user");
    }

    [Fact]
    public void Should_return_wantlist_when_card_is_added()
    {
        var expectedWantlist = new GEntities.Wantlist("fav", "fav", "user")
        {
            Cards = [ new("fav", "Conflux")]
        };
        _wantlistRepository.GetById("fav").Returns(expectedWantlist);

        var actualWantlist = _handler.UpdateWantlist(
            new BReqREntities.UpdateWantlistRequest("fav", ["Conflux"])
        );

        _wantlistCardsRepository.Received().UpdateWantlist(
            "fav",
            Arg.Is<IEnumerable<string>>(
                cards => cards.Contains("Conflux")
            )
        );
        actualWantlist.Should().Be(expectedWantlist);
    }
}
