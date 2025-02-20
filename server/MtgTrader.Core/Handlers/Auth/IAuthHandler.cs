using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;

namespace MtgTrader.Core.Handlers.Auth;

public interface IAuthHandler
{
    AuthResponse? Connect(AuthRequest authRequest);
    AuthResponse? CreateUser(AuthRequest value);
    bool CheckTokenValidity(string invalidToken);
}
