using MachineProjectAPI.Data;
using MachineProjectAPI.Models;
using MachineProjectAPI.Models.Auth;
using MachineProjectAPI.Services;
using Microsoft.AspNetCore.Authorization;
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

        /// <summary>
        /// Create a staff (or admin) account. Admin-only — staff access is granted
        /// by the admin, not self-signed-up, per the client's access control.
        /// POST /api/auth/register
        /// </summary>
        [HttpPost("register")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            var normalizedUsername = request.Username.Trim().ToLowerInvariant();

            var usernameTaken = await _context.Users.AnyAsync(u => u.Username == normalizedUsername);
            if (usernameTaken)
            {
                return Conflict(new { message = "This username is already taken." });
            }

            var role = request.Role == UserRoles.Admin ? UserRoles.Admin : UserRoles.Staff;

            var user = new User
            {
                FullName = request.FullName.Trim(),
                Username = normalizedUsername,
                Role = role,
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

            if (user is null || !user.IsActive)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (verification == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            if (user.Role == UserRoles.Staff)
            {
                var clientIp = ClientIpHelper.GetClientIp(HttpContext);
                var allowed = !string.IsNullOrEmpty(clientIp)
                    && await _context.StaffAccessIps.AnyAsync(w => w.IpAddress == clientIp);

                if (!allowed)
                {
                    return StatusCode(403, new
                    {
                        message = $"Staff login is only allowed from the office network. This connection ({clientIp ?? "unknown"}) isn't whitelisted — ask an admin to add it under Staff Access.",
                    });
                }
            }

            return Ok(BuildAuthResponse(user));
        }

        /// <summary>
        /// Lets an admin see the IP a connection is coming from, to quickly
        /// whitelist the office network. No sensitive data — safe to leave open.
        /// GET /api/auth/my-ip
        /// </summary>
        [HttpGet("my-ip")]
        [AllowAnonymous]
        public ActionResult<object> MyIp()
        {
            return Ok(new { ip = ClientIpHelper.GetClientIp(HttpContext) });
        }

        /// <summary>
        /// List staff/admin accounts (no password hashes). Admin-only.
        /// GET /api/auth/users
        /// </summary>
        [HttpGet("users")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult<object>> GetUsers()
        {
            var users = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new { u.Id, u.FullName, u.Username, u.Role, u.IsActive, u.CreatedAt })
                .ToListAsync();

            return Ok(users);
        }

        /// <summary>
        /// Deactivate a staff/admin account (soft delete — blocks future logins).
        /// DELETE /api/auth/users/{id}
        /// </summary>
        [HttpDelete("users/{id:int}")]
        [Authorize(Roles = UserRoles.Admin)]
        public async Task<ActionResult> DeactivateUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            user.IsActive = false;
            await _context.SaveChangesAsync();
            return NoContent();
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
                Role = user.Role,
            };
        }
    }
}
