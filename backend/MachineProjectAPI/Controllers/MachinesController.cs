using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MachineProjectAPI.Services;

namespace MachineProjectAPI.Controllers
{
    [ApiController]
    [Route("api/machines")]
    [Authorize]
    public class MachinesController : ControllerBase
    {
        private readonly IOcrService _ocrService;
        private readonly ILogger<MachinesController> _logger;

        public MachinesController(IOcrService ocrService, ILogger<MachinesController> logger)
        {
            _ocrService = ocrService;
            _logger = logger;
        }

        /// <summary>
        /// Extract machine nameplate data from an image using OCR.
        /// POST /api/machines/extract-from-image
        /// </summary>
        [HttpPost("extract-from-image")]
        public async Task<IActionResult> ExtractNameplateFromImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest(new { message = "No image file provided" });
            }

            try
            {
                // Validate file type (allow image formats)
                var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
                if (!allowedMimeTypes.Contains(image.ContentType))
                {
                    return BadRequest(new { message = "Invalid image format. Allowed: JPEG, PNG, WebP, GIF" });
                }

                // Validate file size (max 5MB)
                if (image.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "Image file too large. Maximum 5MB allowed" });
                }

                // Extract nameplate data using OCR service
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
    }
}
