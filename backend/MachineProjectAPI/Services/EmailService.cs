using System.Net;
using System.Net.Mail;

namespace MachineProjectAPI.Services
{
    public interface IEmailService
    {
        // Sends a plain-text notification to the business owner. Never throws:
        // a mail problem must not break a visitor's enquiry.
        Task SendToOwnerAsync(string subject, string body);
    }

    // SMTP settings come from configuration (Smtp:Host, Port, User, Password, From, NotifyTo).
    // Without Smtp:Host the service does nothing, so the site works before mail is set up.
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendToOwnerAsync(string subject, string body)
        {
            var host = _config["Smtp:Host"];
            if (string.IsNullOrWhiteSpace(host)) return;

            try
            {
                var user = _config["Smtp:User"] ?? string.Empty;
                var from = _config["Smtp:From"] ?? user;
                var to = _config["Smtp:NotifyTo"] ?? "nikhhilkgarg@gmail.com";
                var port = int.TryParse(_config["Smtp:Port"], out var p) ? p : 587;

                using var client = new SmtpClient(host, port)
                {
                    EnableSsl = !string.Equals(_config["Smtp:EnableSsl"], "false", StringComparison.OrdinalIgnoreCase),
                    Credentials = new NetworkCredential(user, _config["Smtp:Password"] ?? string.Empty),
                    Timeout = 15000,
                };
                using var message = new MailMessage(from, to, subject, body);
                await client.SendMailAsync(message);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not send notification email '{Subject}'.", subject);
            }
        }
    }
}
