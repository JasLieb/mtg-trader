using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Repositories;
using MtgTrader.Core.Services;

namespace MtgTrader.Core.Handlers.Auth;

public class AuthHandler(
    IUserRepository userRepository,
    IWantlistRepository wantlistRepository,
    ITokenService tokenService
) : IAuthHandler
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IWantlistRepository _wantlistRepository = wantlistRepository;
    private readonly ITokenService _tokenService = tokenService;

    public AuthResponse? Connect(AuthRequest authRequest)
    {
        var user = _userRepository.GetByUsername(authRequest.Email);

        if (user is not null && user.Password == authRequest.Password)
            return new AuthResponse(_tokenService.CreateToken(user));

        return null;
    }

    public AuthResponse? CreateUser(AuthRequest authRequest)
    {
        var canCreateUser = _userRepository.GetByUsername(authRequest.Email) is null;
        if (canCreateUser)
        {
            var userId = Guid.NewGuid().ToString();
            var user = _userRepository.Create(new(
                userId,
                authRequest.Email,
                authRequest.Password
            ));
            _wantlistRepository.Create(
                new($"{userId}_doubles", "doubles", userId)
            );
            return new AuthResponse(_tokenService.CreateToken(user));
        }
        return null;
    }

    public bool CheckTokenValidity(string token) =>
        _tokenService.CheckToken(token);
}
