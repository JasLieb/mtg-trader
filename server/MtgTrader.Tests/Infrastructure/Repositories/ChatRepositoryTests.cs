namespace MtgTrader.Tests.Infrastructure.Repositories;

public class ChatRepositoryTests
{
    private readonly DateTime _testedDateTime = new(2025, 3, 1);
    private Mock<ApplicationContext> _dbContextMock;
    private ChatRepository _chatRepository;

    public ChatRepositoryTests()
    {
        _dbContextMock = new Mock<ApplicationContext>(new DbContextOptions<ApplicationContext>());
        _chatRepository = new ChatRepository(_dbContextMock.Object);
    }

    [Fact]
    public void Should_return_chats_when_find_user_chats()
    {
        var connectedUser = new User("idk", "toto", "toto");
        var chatsMessageDbSetMock = 
            new List<ChatMessage> 
            { 
                new("", "hello", connectedUser.Id, "recipient", _testedDateTime),
                new("", "hello", "recipientAsAuthor", connectedUser.Id, _testedDateTime),
                new("", "hello", "recipientAsAuthor", "anotherRecipient", _testedDateTime),
            }.AsDbSetMock();
        _dbContextMock.Setup(db => db.Set<ChatMessage>())
            .Returns(chatsMessageDbSetMock.Object);
        var userDbSetMock = new Mock<DbSet<User>>();
        _dbContextMock.Setup(db => db.Set<User>())
            .Returns(userDbSetMock.Object);

        var result = _chatRepository.FindChatMessages(connectedUser.Id);

        result.Should().HaveCount(2);
    }
    
    [Fact]
    public void Should_add_message_chat_when_add_message()
    {
        var user = new User("toto", "toto", "toto");
        var chatsMessageDbSetMock = new Mock<DbSet<ChatMessage>>();
        _dbContextMock.Setup(db => db.Set<ChatMessage>())
            .Returns(chatsMessageDbSetMock.Object);

        var newMessage = new ChatMessage("id", "hello world", "toto", "recipient", _testedDateTime);
        _chatRepository.AddMessage(newMessage);

        chatsMessageDbSetMock.Verify(m => m.Add(It.IsAny<ChatMessage>()), Times.Once());
    }
}
