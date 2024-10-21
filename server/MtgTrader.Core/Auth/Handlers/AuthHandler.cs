using System;
using MtgTrader.Core.Auth.Domain;

namespace MtgTrader.Core.Auth.Handlers;


public class AuthHandler
{
    public AuthHandler()
    {

    }

    public User? Connect(AuthRequest authRequest)
    {
        return authRequest.Email == "root"
            ? new User("123", authRequest.Email, authRequest.Password)
            : null;
    }
}
