namespace MtgTrader.Core.Entities.Business.Requests;

// Cards are seen from the proposer: GivenCards come from their doubles list, ReceivedCards from the recipient's.
public record class SendTradeProposalRequest(
    string RecipientId,
    IEnumerable<string> GivenCards,
    IEnumerable<string> ReceivedCards
);
