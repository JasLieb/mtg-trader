namespace MtgTrader.Tests.Core.Chat;

public class ChatHandlerTests
{
    private readonly DateTime _testedDateTime = new(2025, 3, 1);
    private readonly IDateTimeService _dateTimeService;
    private readonly IChatConnectionService _chatConnection;
    private readonly IChatRepository _chatRepository;
    private readonly ChatHandler _handler;

    public ChatHandlerTests()
    {
        _dateTimeService = Substitute.For<IDateTimeService>();
        _dateTimeService.Now.Returns(_testedDateTime);

        _chatConnection = Substitute.For<IChatConnectionService>();
        _chatRepository = Substitute.For<IChatRepository>();

        _handler = new ChatHandler(_chatRepository, _chatConnection, _dateTimeService);
    }

    [Fact]
    public void Should_return_true_when_add_connection_and_not_exists()
    {
        _chatConnection.AddConnection("userID", "connectionId").Returns(true);

        _handler.AddConnection("userID", "connectionId").Should().BeTrue();
    }

    [Fact]
    public void Should_return_false_when_add_connection_and_already_exists()
    {
        _chatConnection.AddConnection("userID", "connectionId").Returns(false);
        _handler.AddConnection("userID", "connectionId").Should().BeFalse();
    }

    [Fact]
    public void Should_return_true_when_remove_connection_and_exists()
    {
        _chatConnection.RemoveConnection("userID").Returns(true);

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
        _chatConnection.FindConnection("userId").Returns("connectionId");

        var connectionId = _handler.FindConnection("userId");

        connectionId.Should().Be("connectionId");
    }

    [Fact]
    public void Should_return_null_when_connection_not_exists()
    {
        _chatConnection.FindConnection(null!).ReturnsForAnyArgs(null as string);

        var connectionId = _handler.FindConnection("userId");

        connectionId.Should().BeNull();
    }

    [Fact]
    public void Should_add_message_repository_when_add_message()
    {
        var message = new ChatMessage("id", "message", "author", "recipient", _testedDateTime);

        _handler.AddMessage("author", "recipient", "message");

        _chatRepository.Received().AddMessage(
            Arg.Is<ChatMessage>(cm =>
                cm.AuthorId == "author"
                && cm.RecipientId == "recipient"
                && cm.Message == "message"
                && cm.Date == _testedDateTime
            )
        );
    }

    [Fact]
    public void Should_return_grouped_chats_when_load_message_history()
    {
        var connectedUserId = "userId";
        var messageHistory = new List<ChatMessage>
        {
            new("1", "hello", connectedUserId, "recipient", _testedDateTime),
            new("2", "hello", "recipient", connectedUserId, _testedDateTime)
        };
        _chatRepository.FindChatMessages(connectedUserId).Returns(
            messageHistory
        );

        var chatResponse = _handler.LoadMessageHistory(connectedUserId);

        chatResponse.Chats.Should().HaveCount(1);
        chatResponse.Chats.ElementAt(0).ChatMessages.Should().BeEquivalentTo(messageHistory);
    }
}
