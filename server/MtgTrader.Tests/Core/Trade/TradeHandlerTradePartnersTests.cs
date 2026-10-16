namespace MtgTrader.Tests.Core.Trade;

// Trade partners are symmetric: a user is a partner when the Trade match holds at least one card,
// whether they hold doubles I want or want my doubles.
public class TradeHandlerTradePartnersTests
{
    private const string Ragavan = "ragavan-mh2";
    private const string SolRing = "sol-ring-c21";
    private const string Brainstorm = "brainstorm-ema";

    private readonly IWantlistRepository _wantlistRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITradeHandler _tradeHandler;

    public TradeHandlerTradePartnersTests()
    {
        _wantlistRepository = Substitute.For<IWantlistRepository>();
        _userRepository = Substitute.For<IUserRepository>();
        _tradeHandler = new TradeHandler(_wantlistRepository, _userRepository);
    }

    [Fact]
    public void Should_return_user_wanting_my_doubles_when_i_want_none_of_their_doubles()
    {
        GivenLists("alice", wanted: [Ragavan], doubles: [SolRing]);
        GivenTradeableDoubles();
        GivenUsersWantingMyDoubles("carol");
        GivenUsers("carol");
        GivenPartnersLists(
            Lists("carol", wanted: [SolRing], doubles: [Brainstorm])
        );

        var response = _tradeHandler.FindTrades("alice");

        response.Users.Should().ContainSingle().Which.Should().BeEquivalentTo(
            new UserTradeResponse("carol", "carol@mail", [], [SolRing])
        );
    }

    [Fact]
    public void Should_return_user_holding_doubles_i_want_when_they_want_none_of_mine()
    {
        GivenLists("carol", wanted: [SolRing], doubles: [Brainstorm]);
        GivenTradeableDoubles(Lists("alice", wanted: [], doubles: [SolRing]).Doubles);
        GivenUsersWantingMyDoubles();
        GivenUsers("alice");
        GivenPartnersLists(
            Lists("alice", wanted: [Ragavan], doubles: [SolRing])
        );

        var response = _tradeHandler.FindTrades("carol");

        response.Users.Should().ContainSingle().Which.Should().BeEquivalentTo(
            new UserTradeResponse("alice", "alice@mail", [SolRing], [])
        );
    }

    [Fact]
    public void Should_look_for_users_wanting_my_doubles_cards_when_trade()
    {
        GivenLists("alice", wanted: [Ragavan], doubles: [SolRing, Brainstorm]);

        _tradeHandler.FindTrades("alice");

        _wantlistRepository.Received().FindUserIdsWantingCards(
            "alice",
            Arg.Is<IEnumerable<string>>(ids => ids.SequenceEqual(new[] { SolRing, Brainstorm }))
        );
    }

    [Fact]
    public void Should_return_partner_once_when_trade_match_runs_both_ways()
    {
        GivenLists("alice", wanted: [Ragavan], doubles: [SolRing]);
        var bob = Lists("bob", wanted: [SolRing], doubles: [Ragavan, Brainstorm]);
        GivenTradeableDoubles(bob.Doubles);
        GivenUsersWantingMyDoubles("bob");
        GivenUsers("bob");
        GivenPartnersLists(bob);

        var response = _tradeHandler.FindTrades("alice");

        response.Users.Should().ContainSingle().Which.Should().BeEquivalentTo(
            new UserTradeResponse("bob", "bob@mail", [Ragavan], [SolRing])
        );
    }

    [Fact]
    public void Should_return_both_kinds_of_partners_when_trade()
    {
        GivenLists("alice", wanted: [Ragavan], doubles: [SolRing]);
        var bob = Lists("bob", wanted: [], doubles: [Ragavan]);
        var carol = Lists("carol", wanted: [SolRing], doubles: [Brainstorm]);
        GivenTradeableDoubles(bob.Doubles);
        GivenUsersWantingMyDoubles("carol");
        GivenUsers("bob", "carol");
        GivenPartnersLists(bob, carol);

        var response = _tradeHandler.FindTrades("alice");

        response.Users.Should().BeEquivalentTo(
            [
                new UserTradeResponse("bob", "bob@mail", [Ragavan], []),
                new UserTradeResponse("carol", "carol@mail", [], [SolRing]),
            ]
        );
    }

    [Fact]
    public void Should_return_no_partner_when_no_card_in_common()
    {
        GivenLists("alice", wanted: [Ragavan], doubles: [SolRing]);
        GivenTradeableDoubles();
        GivenUsersWantingMyDoubles();
        GivenUsers();
        GivenPartnersLists();

        var response = _tradeHandler.FindTrades("alice");

        response.Users.Should().BeEmpty();
    }

    private void GivenLists(string userId, string[] wanted, string[] doubles)
    {
        var lists = Lists(userId, wanted, doubles);
        _wantlistRepository.GetUserWantlists(userId).Returns([lists.Wanted, lists.Doubles]);
    }

    private void GivenTradeableDoubles(params GEntities.Wantlist[] doublesLists)
    {
        _wantlistRepository.FindTradeableDoubles(default!, default!).ReturnsForAnyArgs(doublesLists);
    }

    private void GivenUsersWantingMyDoubles(params string[] userIds)
    {
        _wantlistRepository.FindUserIdsWantingCards(default!, default!).ReturnsForAnyArgs(userIds);
    }

    private void GivenUsers(params string[] userIds)
    {
        _userRepository.GetByUserIds(default!).ReturnsForAnyArgs(
            userIds.Select(id => new User(id, $"{id}@mail", "")).ToList()
        );
    }

    private void GivenPartnersLists(params UserLists[] partnersLists)
    {
        _wantlistRepository.GetUsersWantlists(default!).ReturnsForAnyArgs(
            partnersLists.SelectMany(lists => new[] { lists.Wanted, lists.Doubles }).ToList()
        );
    }

    private static UserLists Lists(string userId, string[] wanted, string[] doubles)
    {
        var wantlistId = $"{userId}-wantlist";
        var doublesId = DoublesList.IdFor(userId);
        return new(
            new GEntities.Wantlist(wantlistId, "wantlist", userId)
            {
                Cards = [.. wanted.Select(card => new WantlistCards(wantlistId, card))]
            },
            new GEntities.Wantlist(doublesId, "doubles", userId)
            {
                Cards = [.. doubles.Select(card => new WantlistCards(doublesId, card))]
            }
        );
    }

    private record UserLists(GEntities.Wantlist Wanted, GEntities.Wantlist Doubles);
}
