namespace MtgTrader.Core.Entities.Business.Responses;

// A Trade partner's whole Doubles list, as Scryfall card ids only. None of their Wantlists is ever included.
public record PartnerDoublesResponse(
    IEnumerable<string> Cards
);
