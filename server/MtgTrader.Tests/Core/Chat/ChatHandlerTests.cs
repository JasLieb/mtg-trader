namespace MtgTrader.Tests.Core.Chat;

public class ChatHandlerTests
{
    private readonly IChatRepository _chatRepository;
    private readonly ChatHandler _handler;

    public ChatHandlerTests()
    {
        _chatRepository = Substitute.For<IChatRepository>();
        _handler = new ChatHandler(_chatRepository);
    }

    [Fact]
    public void Should_return_true_when_add_connection_and_not_exists()
    {
        _handler.AddConnection("userID", "connectionId").Should().BeTrue();

        // Clean
        // TODO Remove next line by injecting connection manager to handler
        _handler.RemoveConnection("userID");
    }

    [Fact]
    public void Should_return_false_when_add_connection_and_already_exists()
    {
        _handler.AddConnection("userID", "connectionId");
        _handler.AddConnection("userID", "connectionId").Should().BeFalse();

        // Clean
        // TODO Remove next line by injecting connection manager to handler
        _handler.RemoveConnection("userID");
    }

    [Fact]
    public void Should_return_true_when_remove_connection_and_exists()
    {
        _handler.AddConnection("userID", "connectionId");
        _handler.RemoveConnection("userID").Should().BeTrue();
    }

    [Fact]
    public void Should_return_false_when_remove_connection_and_not_exists()
    {
        _handler.RemoveConnection("userID").Should().BeFalse();
    }

    [Fact]
    public void Should_return_connectionId_when_connection_exists()
    {
        _handler.AddConnection("userId", "connectionId");

        var connectionId = _handler.TryFindConnection("userId");

        connectionId.Should().Be("connectionId");

        // Clean
        // TODO Remove next line by injecting connection manager to handler
        _handler.RemoveConnection("userId");
    }

    [Fact]
    public void Should_return_null_when_connection_not_exists()
    {
        var connectionId = _handler.TryFindConnection("userId");

        connectionId.Should().BeNull();
    }

    [Fact]
    public void Should_add_message_repository_when_add_message()
    {
        var message = new ChatMessage("id", "message", "author", "recipient");

        _handler.AddMessage("author", "recipient", "message");

        _chatRepository.Received().AddMessage(
            Arg.Is<ChatMessage>(cm =>
                cm.AuthorId == "author"
                && cm.RecipientId == "recipient"
                && cm.Message == "message"
            )
        );
    }

    [Fact]
    public void Should_return_grouped_chats_when_load_message_history()
    {
        var connectedUserId = "userId";
        var messageHistory = new List<ChatMessage>
        {
            new("1", "hello", connectedUserId, "recipient"),
            new("2", "hello", "recipient", connectedUserId)
        };
        _chatRepository.FindChatMessages(connectedUserId).Returns(
            messageHistory
        );

        var chatResponse = _handler.LoadMessageHistory(connectedUserId);

        chatResponse.Chats.Should().HaveCount(1);
        chatResponse.Chats.ElementAt(0).ChatMessages.Should().BeEquivalentTo(messageHistory);
    }
}
