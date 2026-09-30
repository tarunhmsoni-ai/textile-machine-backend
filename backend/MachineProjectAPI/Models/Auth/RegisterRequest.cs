using System.ComponentModel.DataAnnotations;

namespace MachineProjectAPI.Models.Auth
{
    public class RegisterRequest
    {
        [Required, MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }
}
