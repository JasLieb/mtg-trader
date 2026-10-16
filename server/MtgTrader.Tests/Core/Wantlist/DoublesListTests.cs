namespace MtgTrader.Tests.Core.Wantlist;

public class DoublesListTests
{
    [Fact]
    public void Should_append_doubles_suffix_to_user_id_when_build_id()
    {
        DoublesList.IdFor("user1").Should().Be("user1_doubles");
    }

    [Fact]
    public void Should_recognize_doubles_list_when_id_is_built_for_a_user()
    {
        DoublesList.IsDoublesListId(DoublesList.IdFor("user1")).Should().BeTrue();
    }

    [Theory]
    [InlineData("double")]
    [InlineData("doubles")]
    [InlineData("user1_double")]
    [InlineData("user1_doubles_old")]
    [InlineData("doubles_user1")]
    [InlineData("my double list")]
    public void Should_not_recognize_doubles_list_when_id_contains_double_without_doubles_suffix(string wantlistId)
    {
        DoublesList.IsDoublesListId(wantlistId).Should().BeFalse();
    }

    [Fact]
    public void Should_recognize_doubles_list_when_wantlist_id_ends_with_doubles_suffix()
    {
        var doubles = new GEntities.Wantlist(DoublesList.IdFor("user1"), "doubles", "user1");

        DoublesList.IsDoublesList(doubles).Should().BeTrue();
    }

    [Fact]
    public void Should_treat_as_wantlist_when_wantlist_id_contains_double_without_doubles_suffix()
    {
        var wantlist = new GEntities.Wantlist("user1_double_trouble", "double trouble", "user1");

        DoublesList.IsDoublesList(wantlist).Should().BeFalse();
    }
}
