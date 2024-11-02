using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;

namespace MtgTrader.Core.Handlers.Auth;

public class AuthHandler(
    IUserRepository userRepository, 
    IWantlistRepository wantlistRepository
) : IAuthHandler
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IWantlistRepository _wantlistRepository = wantlistRepository;

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
        if(canCreateUser) {
            var userId = Guid.NewGuid().ToString();
            var user = _userRepository.Create(new(
                userId,
                authRequest.Email,
                authRequest.Password
            ));
            _wantlistRepository.Create(
                new($"{userId}_doubles", "doubles", userId)
            );
            return user;
        }
        return null;
    }
}
