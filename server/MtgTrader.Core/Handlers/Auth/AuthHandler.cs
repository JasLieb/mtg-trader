using MtgTrader.Core.Entities.Business.Requests;
using MtgTrader.Core.Entities.Business.Responses;
using MtgTrader.Core.Repositories;
using MtgTrader.Core.Services;

namespace MtgTrader.Core.Handlers.Auth;

public class AuthHandler(
    IUserRepository userRepository,
    ITokenService tokenService,
    IPasswordHasher passwordHasher
) : IAuthHandler
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IPasswordHasher _passwordHasher = passwordHasher;

    public AuthResponse? Connect(AuthRequest authRequest)
    {
        var user = _userRepository.GetByUsername(NormalizeEmail(authRequest.Email));
        if (user is null || !_passwordHasher.Verify(authRequest.Password, user.Password))
            return null;

        // Accounts created before passwords were hashed get their hash at their next login.
        if (!_passwordHasher.IsHashed(user.Password))
        {
            user.Password = _passwordHasher.Hash(authRequest.Password);
            _userRepository.Update(user);
        }

        return new AuthResponse(_tokenService.CreateToken(user));
    }

    public AuthResponse? CreateUser(AuthRequest authRequest)
    {
        var email = NormalizeEmail(authRequest.Email);
        if (_userRepository.GetByUsername(email) is not null)
            return null;

        var userId = Guid.NewGuid().ToString();
        var user = _userRepository.CreateWithDoubles(
            new(userId, email, _passwordHasher.Hash(authRequest.Password)),
            new($"{userId}_doubles", "doubles", userId)
        );
        return user is null ? null : new AuthResponse(_tokenService.CreateToken(user));
    }

    public AuthResponse? CheckTokenValidity(string token) =>
        !string.IsNullOrEmpty(_tokenService.CheckToken(token))
        ? new(token)
        : null;

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
