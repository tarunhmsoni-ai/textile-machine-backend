using MachineProjectAPI.Data;
using MachineProjectAPI.Models;
using MachineProjectAPI.Models.Auth;
using MachineProjectAPI.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MachineProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TokenService _tokenService;
        private readonly PasswordHasher<User> _passwordHasher = new();

        public AuthController(ApplicationDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            var normalizedUsername = request.Username.Trim().ToLowerInvariant();

            var usernameTaken = await _context.Users.AnyAsync(u => u.Username == normalizedUsername);
            if (usernameTaken)
            {
                return Conflict(new { message = "This username is already taken." });
            }

            var user = new User
            {
                FullName = request.FullName.Trim(),
                Username = normalizedUsername,
            };
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(BuildAuthResponse(user));
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var normalizedUsername = request.Username.Trim().ToLowerInvariant();
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == normalizedUsername);

            if (user is null)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verification == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            return Ok(BuildAuthResponse(user));
        }

        private AuthResponse BuildAuthResponse(User user)
        {
            var (token, expiresAt) = _tokenService.GenerateToken(user);
            return new AuthResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                FullName = user.FullName,
                Username = user.Username,
            };
        }
    }
}
