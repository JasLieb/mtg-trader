using System;
using MtgTrader.Core.Auth.Domain;

namespace MtgTrader.Core.Auth.Handlers;


public class AuthHandler
{
    public AuthHandler()
    {

    }

    public bool Connect(AuthRequest authRequest)
    {
        return authRequest.Email == "root";
    }
}
