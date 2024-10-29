using System;
using MtgTrader.Core.Entities.Business;
using MtgTrader.Core.Entities.General;

namespace MtgTrader.Core.Handlers.Auth;

public interface IAuthHandler
{
    User? Connect(AuthRequest authRequest);
    User? CreateUser(AuthRequest value);
}
