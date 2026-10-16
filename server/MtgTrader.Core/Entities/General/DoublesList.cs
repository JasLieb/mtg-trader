namespace MtgTrader.Core.Entities.General;

// A user's doubles list is an ordinary Wantlist whose id is "{userId}_doubles".
// This is the server's only definition of that format; the client mirrors it in doubles-list.ts.
public static class DoublesList
{
    public const string IdSuffix = "_doubles";

    public static string IdFor(string userId) => $"{userId}{IdSuffix}";

    public static bool IsDoublesListId(string wantlistId) =>
        wantlistId.EndsWith(IdSuffix, StringComparison.Ordinal);

    public static bool IsDoublesList(Wantlist wantlist) => IsDoublesListId(wantlist.Id);
}
