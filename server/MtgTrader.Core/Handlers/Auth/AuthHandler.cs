using MtgTrader.Core.Entities.Business;
using MtgTrader.Core.Entities.General;
using MtgTrader.Core.Repositories;

namespace MtgTrader.Core.Handlers.Auth;

public class AuthHandler(IUserRepository userRepository) : IAuthHandler
{
    private readonly IUserRepository _userRepository = userRepository;

    public User? Connect(AuthRequest authRequest)
    {
        // var u = _userRepository.IsExists()).FirstOrDefault();
        return authRequest.Email == "root"
            ? new User("123", authRequest.Email, authRequest.Password)
            : null;
    }
}
