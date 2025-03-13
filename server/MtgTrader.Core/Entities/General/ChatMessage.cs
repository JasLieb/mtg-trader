namespace MtgTrader.Core.Entities.General;

public class ChatMessage(
    string id,
    string message,
    string authorId,
    string recipientId,
    DateTime date
)
{

    public string Id { get; set; } = id;
    public string Message { get; set; } = message;
    public string AuthorId { get; set; } = authorId;
    public string RecipientId { get; set; } = recipientId;
    public DateTime Date { get; set; } = date;

    public User? Author { get; set; }
    public User? Recipient { get; set; }
}
