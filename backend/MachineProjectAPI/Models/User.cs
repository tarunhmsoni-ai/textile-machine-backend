namespace MachineProjectAPI.Models
{
    public class User : BaseEntity
    {
        public string FullName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        // Admin: unrestricted, can log in from anywhere, sees KPIs/commissions.
        // Staff: can only log in from a whitelisted office IP (see StaffAccessIp).
        public string Role { get; set; } = "Staff";
    }

    public static class UserRoles
    {
        public const string Admin = "Admin";
        public const string Staff = "Staff";
    }
}
