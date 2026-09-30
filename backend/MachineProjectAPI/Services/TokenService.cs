using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MachineProjectAPI.Models;
using Microsoft.IdentityModel.Tokens;

namespace MachineProjectAPI.Services
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public (string Token, DateTime ExpiresAt) GenerateToken(User user)
        {
            var jwtSection = _configuration.GetSection("Jwt");
            var secretKey = jwtSection["SecretKey"]!;
            var issuer = jwtSection["Issuer"];
            var audience = jwtSection["Audience"];
            var expirationMinutes = int.Parse(jwtSection["ExpirationMinutes"] ?? "60");

            var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("fullName", user.FullName),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials);

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
        }
    }
}
