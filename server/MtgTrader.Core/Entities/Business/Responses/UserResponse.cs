namespace MtgTrader.Core.Entities.Business.Responses;

public record class UserResponse(
    string Id,
    string Name,
    IEnumerable<WantlistResponse> Wantlists
);
