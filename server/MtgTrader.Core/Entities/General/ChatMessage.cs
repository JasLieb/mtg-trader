namespace MtgTrader.Core.Entities.General;

public class ChatMessage(
    string id,
    string message,
    string authorId
)
{
    public string Id { get; set; } = id;
    public string Message { get; set; } = message;
    public string AuthorId { get; set; } = authorId;
    
    public User? Author { get; set; }
}
