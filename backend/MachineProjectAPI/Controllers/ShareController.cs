using System.Net;
using MachineProjectAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MachineProjectAPI.Controllers
{
    // Link-preview crawlers (WhatsApp, Facebook, ...) can't run the React app, so the
    // main-domain web server redirects them here to get proper Open Graph tags.
    [ApiController]
    [Route("share")]
    public class ShareController : ControllerBase
    {
        private const string SiteOrigin = "https://knittingmachine.in";
        private const string ApiOrigin = "https://api.knittingmachine.in";

        private readonly ApplicationDbContext _context;

        public ShareController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("machines/{id:int}")]
        public async Task<ContentResult> Machine(int id)
        {
            var m = await _context.Machines.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
            if (m == null)
            {
                return Content("<!doctype html><html><head><meta charset=\"utf-8\"><title>Machine not found</title></head><body>Machine not found</body></html>", "text/html; charset=utf-8");
            }

            var subtype = string.IsNullOrWhiteSpace(m.SubType) ? m.Type : m.SubType;
            var title = $"{m.Brand} {m.Model} — {subtype}".Trim();
            var parts = new List<string> { subtype };
            if (!string.IsNullOrWhiteSpace(m.Location)) parts.Add($"Location: {m.Location}");
            if (m.Year > 0) parts.Add($"Year: {m.Year}");
            parts.Add("Available for sale on Textile Machine");
            var description = string.Join(" · ", parts.Where(p => !string.IsNullOrWhiteSpace(p)));

            var photo = m.Photos.FirstOrDefault();
            var image = string.IsNullOrEmpty(photo)
                ? $"{SiteOrigin}/machines/karl-mayer-hks3m-plate.webp"
                : photo.StartsWith("http", StringComparison.OrdinalIgnoreCase) ? photo : $"{ApiOrigin}{photo}";
            var pageUrl = $"{SiteOrigin}/machines/{id}";

            string E(string s) => WebUtility.HtmlEncode(s);
            var html = $@"<!doctype html>
<html lang=""en"">
<head>
<meta charset=""UTF-8"" />
<title>{E(title)}</title>
<meta property=""og:title"" content=""{E(title)}"" />
<meta property=""og:description"" content=""{E(description)}"" />
<meta property=""og:image"" content=""{E(image)}"" />
<meta property=""og:url"" content=""{E(pageUrl)}"" />
<meta property=""og:type"" content=""product"" />
<meta name=""twitter:card"" content=""summary_large_image"" />
<meta name=""twitter:title"" content=""{E(title)}"" />
<meta name=""twitter:description"" content=""{E(description)}"" />
<meta name=""twitter:image"" content=""{E(image)}"" />
</head>
<body>
<p><a href=""{E(pageUrl)}"">{E(title)}</a></p>
</body>
</html>";
            return Content(html, "text/html; charset=utf-8");
        }
    }
}
