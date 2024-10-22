using System;
using MtgTrader.Core.Auth.Domain;

namespace MtgTrader.Core.Auth.Handlers;


public class AuthHandler(AuthContext authContext)
{
    private readonly AuthContext _authContext = authContext;

    public User? Connect(AuthRequest authRequest)
    {
        var u = _authContext.Users.FirstOrDefault();
        return authRequest.Email == "root"
            ? new User("123", authRequest.Email, authRequest.Password)
            : null;
    }
}
