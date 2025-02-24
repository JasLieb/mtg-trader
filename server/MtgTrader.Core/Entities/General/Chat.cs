namespace MtgTrader.Core.Entities.General;

public record Chat(
    string RecipientId, 
    IEnumerable<ChatMessage> ChatMessages
);