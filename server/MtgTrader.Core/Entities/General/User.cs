namespace MtgTrader.Core.Entities.General;

public class User(string id, string username, string password)
{
    public string Id { get; set; } = id;
    public string Username { get; set; } = username;
    public string Password { get; set; } = password;
}