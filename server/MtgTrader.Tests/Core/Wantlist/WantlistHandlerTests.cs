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
    public void Should_return_new_wantlist_when_is_created()
    {
        var expectedWantlist = new GEntities.Wantlist("id", "new", "user");
        _wantlistRepository.Create(Arg.Any<GEntities.Wantlist>()).Returns(expectedWantlist);
        
        var actualWantlist = _handler.CreateWantlist(
            new BEntities.CreateWantlistRequest("new", "user")
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

        var actualWantlist = _handler.AddCard(
            new BEntities.AddCardRequest("Conflux", "fav")
        );

        _wantlistCardsRepository.Received().Create(
            Arg.Is<GEntities.WantlistCards>(
                w => w.CardId == "Conflux"  && w.WantlistId == "fav"
            )
        );
        actualWantlist.Should().Be(expectedWantlist);
    }
}
