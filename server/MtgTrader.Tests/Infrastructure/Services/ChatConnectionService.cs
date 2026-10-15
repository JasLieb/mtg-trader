namespace MtgTrader.Tests.Infrastructure.Services;

public class ChatConnectionServiceTests
{
    private readonly ChatConnectionService _chatConnection;

    public ChatConnectionServiceTests()
    {
        _chatConnection = new ChatConnectionService();
    }

    [Fact]
    public void Should_return_true_when_add_connection_and_not_exists()
    {
        _chatConnection.AddConnection("userID", "connectionId").Should().BeTrue();
    }

    [Fact]
    public void Should_return_false_when_add_connection_and_already_exists()
    {
        _chatConnection.AddConnection("userID", "connectionId");

        _chatConnection.AddConnection("userID", "connectionId").Should().BeFalse();
    }

    [Fact]
    public void Should_return_true_when_remove_connection_and_exists()
    {
        _chatConnection.AddConnection("userID", "connectionId");

        _chatConnection.RemoveConnection("userID", "connectionId").Should().BeTrue();
    }

    [Fact]
    public void Should_return_false_when_remove_connection_and_not_exists()
    {
        _chatConnection.RemoveConnection("userID", "connectionId").Should().BeFalse();
    }

    [Fact]
    public void Should_keep_connection_when_another_connection_of_the_user_disconnects()
    {
        _chatConnection.AddConnection("userID", "firstTab");

        _chatConnection.RemoveConnection("userID", "secondTab").Should().BeFalse();

        _chatConnection.FindConnection("userID").Should().Be("firstTab");
    }

    [Fact]
    public void Should_return_connectionId_when_connection_exists()
    {
        _chatConnection.AddConnection("userId", "connectionId");

        var connectionId = _chatConnection.FindConnection("userId");

        connectionId.Should().Be("connectionId");
    }

    [Fact]
    public void Should_return_null_when_connection_not_exists()
    {
        var connectionId = _chatConnection.FindConnection("userId");

        connectionId.Should().BeNull();
    }
}
