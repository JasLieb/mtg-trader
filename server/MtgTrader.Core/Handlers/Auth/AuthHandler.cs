using MtgTrader.Core.Entities.Business;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;

namespace MtgTrader.Core.Handlers.Auth;

public class AuthHandler(IUserRepository userRepository) : IAuthHandler
{
    private readonly IUserRepository _userRepository = userRepository;

    public User? Connect(AuthRequest authRequest)
    {
        var user = _userRepository.GetByUsername(authRequest.Email);
        return user is not null && user.Password == authRequest.Password
            ? user
            : null;
    }

    public User? CreateUser(AuthRequest authRequest)
    {
        var canCreateUser = _userRepository.GetByUsername(authRequest.Email) is null;
        return canCreateUser
        ? _userRepository.Create(new(
            Guid.NewGuid().ToString(),
            authRequest.Email,
            authRequest.Password
        ))
        : null;
    }
}
