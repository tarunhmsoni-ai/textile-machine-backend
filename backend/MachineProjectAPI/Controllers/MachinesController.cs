using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MachineProjectAPI.Data;
using MachineProjectAPI.Models;
using MachineProjectAPI.Services;
using System.Text.Json;

namespace MachineProjectAPI.Controllers
{
    [ApiController]
    [Route("api/machines")]
    public class MachinesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IOcrService _ocrService;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<MachinesController> _logger;

        private static readonly string[] AllowedImageTypes = { "image/jpeg", "image/png", "image/webp", "image/gif" };
        private static readonly string[] AllowedVideoTypes = { "video/mp4", "video/webm", "video/quicktime" };
        private const long MaxImageBytes = 8 * 1024 * 1024; // 8MB
        private const long MaxVideoBytes = 50 * 1024 * 1024; // 50MB

        public MachinesController(
            ApplicationDbContext context,
            IOcrService ocrService,
            IWebHostEnvironment env,
            ILogger<MachinesController> logger)
        {
            _context = context;
            _ocrService = ocrService;
            _env = env;
            _logger = logger;
        }

        /// <summary>
        /// List machines, optionally filtered. Public — powers the homepage and listings grid.
        /// GET /api/machines?type=&search=&location=&minPrice=&maxPrice=
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<MachineListDto>>> GetMachines(
            [FromQuery] string? type,
            [FromQuery] string? search,
            [FromQuery] string? location,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice)
        {
            var query = _context.Machines
                .Where(m => m.IsActive && m.Status == "Live")
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(type))
            {
                query = query.Where(m => m.Type.ToLower() == type.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(m =>
                    m.Brand.ToLower().Contains(s) ||
                    m.Model.ToLower().Contains(s) ||
                    m.SubType.ToLower().Contains(s));
            }

            if (!string.IsNullOrWhiteSpace(location))
            {
                query = query.Where(m => m.Location.ToLower().Contains(location.ToLower()));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(m => m.AskingPrice >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(m => m.AskingPrice <= maxPrice.Value);
            }

            var machines = await query.OrderByDescending(m => m.DatePosted).ToListAsync();

            var result = machines.Select(ToListDto).ToList();
            return Ok(result);
        }

        /// <summary>
        /// Single machine detail. Public — powers the machine detail page.
        /// GET /api/machines/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<MachineDetailDto>> GetMachine(int id)
        {
            var machine = await _context.Machines
                .Include(m => m.PostedByUser)
                .FirstOrDefaultAsync(m => m.Id == id && m.IsActive);

            if (machine == null)
            {
                return NotFound(new { message = "Machine not found." });
            }

            machine.ViewCount += 1;
            await _context.SaveChangesAsync();

            return Ok(ToDetailDto(machine));
        }

        /// <summary>
        /// Create a machine listing with photo/video upload. Requires login (admin panel).
        /// POST /api/machines (multipart/form-data)
        /// </summary>
        [HttpPost]
        [Authorize]
        [RequestSizeLimit(100 * 1024 * 1024)]
        public async Task<ActionResult<MachineDetailDto>> CreateMachine([FromForm] MachineFormRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Type) || string.IsNullOrWhiteSpace(request.Brand) ||
                string.IsNullOrWhiteSpace(request.Model))
            {
                return BadRequest(new { message = "Type, brand and model are required." });
            }

            var photoUrls = new List<string>();
            if (request.Photos != null)
            {
                foreach (var photo in request.Photos)
                {
                    var url = await SaveUploadAsync(photo, "photos", AllowedImageTypes, MaxImageBytes);
                    if (url == null)
                    {
                        return BadRequest(new { message = $"Invalid photo file: {photo.FileName}. Allowed: JPEG, PNG, WebP, GIF, max 8MB." });
                    }
                    photoUrls.Add(url);
                }
            }

            string? videoUrl = null;
            if (request.Video != null)
            {
                videoUrl = await SaveUploadAsync(request.Video, "videos", AllowedVideoTypes, MaxVideoBytes);
                if (videoUrl == null)
                {
                    return BadRequest(new { message = "Invalid video file. Allowed: MP4, WebM, MOV, max 50MB." });
                }
            }

            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("nameid") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            int? postedByUserId = userIdClaim != null && int.TryParse(userIdClaim.Value, out var uid) ? uid : null;

            var machine = new Machine
            {
                Type = request.Type,
                SubType = request.SubType,
                Brand = request.Brand,
                Model = request.Model,
                Year = request.Year,
                Location = request.Location,
                AskingPrice = request.AskingPrice,
                Quantity = request.Quantity <= 0 ? 1 : request.Quantity,
                Description = request.Description,
                Condition = string.IsNullOrWhiteSpace(request.Condition) ? "Good" : request.Condition,
                SellerName = request.SellerName,
                SellerPhone = request.SellerPhone,
                SellerEmail = request.SellerEmail,
                SellerWhatsApp = request.SellerWhatsApp,
                SpecificationsJson = string.IsNullOrWhiteSpace(request.SpecificationsJson) ? "{}" : request.SpecificationsJson,
                Photos = photoUrls,
                VideoUrl = videoUrl,
                Status = "Live",
                DateLive = DateTime.UtcNow,
                PostedByUserId = postedByUserId,
            };

            _context.Machines.Add(machine);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMachine), new { id = machine.Id }, ToDetailDto(machine));
        }

        /// <summary>
        /// Update an existing machine. New photos/video (if provided) are appended/replaced. Requires login.
        /// PUT /api/machines/{id} (multipart/form-data)
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize]
        [RequestSizeLimit(100 * 1024 * 1024)]
        public async Task<ActionResult<MachineDetailDto>> UpdateMachine(int id, [FromForm] MachineFormRequest request)
        {
            var machine = await _context.Machines.FirstOrDefaultAsync(m => m.Id == id && m.IsActive);
            if (machine == null)
            {
                return NotFound(new { message = "Machine not found." });
            }

            machine.Type = request.Type;
            machine.SubType = request.SubType;
            machine.Brand = request.Brand;
            machine.Model = request.Model;
            machine.Year = request.Year;
            machine.Location = request.Location;
            machine.AskingPrice = request.AskingPrice;
            machine.Quantity = request.Quantity <= 0 ? machine.Quantity : request.Quantity;
            machine.Description = request.Description;
            machine.Condition = string.IsNullOrWhiteSpace(request.Condition) ? machine.Condition : request.Condition;
            machine.SellerName = request.SellerName;
            machine.SellerPhone = request.SellerPhone;
            machine.SellerEmail = request.SellerEmail;
            machine.SellerWhatsApp = request.SellerWhatsApp;
            if (!string.IsNullOrWhiteSpace(request.SpecificationsJson))
            {
                machine.SpecificationsJson = request.SpecificationsJson;
            }

            if (request.Photos != null && request.Photos.Count > 0)
            {
                var newPhotoUrls = new List<string>();
                foreach (var photo in request.Photos)
                {
                    var url = await SaveUploadAsync(photo, "photos", AllowedImageTypes, MaxImageBytes);
                    if (url == null)
                    {
                        return BadRequest(new { message = $"Invalid photo file: {photo.FileName}." });
                    }
                    newPhotoUrls.Add(url);
                }
                machine.Photos = newPhotoUrls;
            }

            if (request.Video != null)
            {
                var url = await SaveUploadAsync(request.Video, "videos", AllowedVideoTypes, MaxVideoBytes);
                if (url == null)
                {
                    return BadRequest(new { message = "Invalid video file." });
                }
                machine.VideoUrl = url;
            }

            machine.LastModified = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(ToDetailDto(machine));
        }

        /// <summary>
        /// Soft-delete (archive) a machine. Requires login.
        /// DELETE /api/machines/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteMachine(int id)
        {
            var machine = await _context.Machines.FirstOrDefaultAsync(m => m.Id == id && m.IsActive);
            if (machine == null)
            {
                return NotFound(new { message = "Machine not found." });
            }

            machine.IsActive = false;
            machine.Status = "Archived";
            machine.LastModified = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// All machines including drafts/archived — for the admin inventory view. Requires login.
        /// GET /api/machines/admin/all
        /// </summary>
        [HttpGet("admin/all")]
        [Authorize]
        public async Task<ActionResult<List<MachineDetailDto>>> GetAllForAdmin()
        {
            var machines = await _context.Machines
                .Where(m => m.IsActive)
                .OrderByDescending(m => m.DatePosted)
                .ToListAsync();

            return Ok(machines.Select(ToDetailDto).ToList());
        }

        /// <summary>
        /// Extract machine nameplate data from an image using OCR.
        /// POST /api/machines/extract-from-image
        /// </summary>
        [HttpPost("extract-from-image")]
        [Authorize]
        public async Task<IActionResult> ExtractNameplateFromImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest(new { message = "No image file provided" });
            }

            try
            {
                if (!AllowedImageTypes.Contains(image.ContentType))
                {
                    return BadRequest(new { message = "Invalid image format. Allowed: JPEG, PNG, WebP, GIF" });
                }

                if (image.Length > MaxImageBytes)
                {
                    return BadRequest(new { message = "Image file too large. Maximum 8MB allowed" });
                }

                using (var stream = image.OpenReadStream())
                {
                    var extractedData = await _ocrService.ExtractNameplateDataAsync(stream, image.FileName);
                    return Ok(extractedData);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error extracting nameplate data: {ex.Message}");
                return StatusCode(500, new { message = "Error processing image. Please try again." });
            }
        }

        /// <summary>
        /// Health check endpoint for machines API
        /// GET /api/machines/health
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", service = "Machines API", timestamp = DateTime.UtcNow });
        }

        private async Task<string?> SaveUploadAsync(IFormFile file, string subfolder, string[] allowedTypes, long maxBytes)
        {
            if (file.Length == 0 || file.Length > maxBytes)
            {
                return null;
            }

            if (!allowedTypes.Contains(file.ContentType))
            {
                return null;
            }

            var webRoot = string.IsNullOrEmpty(_env.WebRootPath)
                ? Path.Combine(_env.ContentRootPath, "wwwroot")
                : _env.WebRootPath;

            var uploadsDir = Path.Combine(webRoot, "uploads", subfolder);
            Directory.CreateDirectory(uploadsDir);

            var safeExt = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid():N}{safeExt}";
            var fullPath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/{subfolder}/{fileName}";
        }

        private static MachineListDto ToListDto(Machine m) => new MachineListDto
        {
            Id = m.Id,
            Type = m.Type.ToLowerInvariant(),
            Subtype = m.SubType,
            Brand = m.Brand,
            Model = m.Model,
            Year = m.Year,
            Location = m.Location,
            Price = m.AskingPrice,
            Photo = m.Photos.FirstOrDefault(),
            Description = m.Description,
        };

        private static MachineDetailDto ToDetailDto(Machine m)
        {
            Dictionary<string, string> specs;
            try
            {
                specs = JsonSerializer.Deserialize<Dictionary<string, string>>(m.SpecificationsJson) ?? new();
            }
            catch
            {
                specs = new();
            }

            return new MachineDetailDto
            {
                Id = m.Id,
                Type = m.Type.ToLowerInvariant(),
                Subtype = m.SubType,
                Brand = m.Brand,
                Model = m.Model,
                Year = m.Year,
                Location = m.Location,
                Description = m.Description,
                Condition = m.Condition,
                Photos = m.Photos,
                VideoUrl = m.VideoUrl,
                Seller = new SellerDto
                {
                    Name = m.SellerName,
                    Phone = m.SellerPhone,
                    Whatsapp = m.SellerWhatsApp,
                    Email = m.SellerEmail,
                },
                Specifications = specs,
                Price = m.AskingPrice,
                Quantity = m.Quantity,
                Status = m.Status,
            };
        }
    }
}
