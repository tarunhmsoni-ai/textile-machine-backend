using Microsoft.AspNetCore.Http;

namespace MachineProjectAPI.Services
{
    // Render sits behind Cloudflare, which sets CF-Connecting-IP to the real
    // visitor IP (and overwrites any client-supplied value, so it's safe to
    // trust). X-Forwarded-For is the fallback for any other proxy hop.
    public static class ClientIpHelper
    {
        public static string? GetClientIp(HttpContext context)
        {
            if (context.Request.Headers.TryGetValue("CF-Connecting-IP", out var cfIp) && !string.IsNullOrWhiteSpace(cfIp))
            {
                return cfIp.ToString().Trim();
            }

            if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var xff) && !string.IsNullOrWhiteSpace(xff))
            {
                return xff.ToString().Split(',')[0].Trim();
            }

            return context.Connection.RemoteIpAddress?.ToString();
        }
    }
}
