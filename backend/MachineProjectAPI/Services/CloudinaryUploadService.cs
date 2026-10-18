using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;

namespace MachineProjectAPI.Services
{
    public interface IUploadService
    {
        // Returns the durable, publicly reachable URL for the uploaded file, or null if upload failed.
        Task<string?> SaveAsync(IFormFile file, string subfolder, string[] allowedTypes, long maxBytes);
    }

    // Render's filesystem is wiped on every deploy/restart, so uploads must
    // live somewhere durable — Cloudinary's free tier, configured via the
    // CLOUDINARY_URL environment variable (cloudinary://key:secret@cloud_name).
    public class CloudinaryUploadService : IUploadService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<CloudinaryUploadService> _logger;

        public CloudinaryUploadService(IConfiguration config, ILogger<CloudinaryUploadService> logger)
        {
            var url = config["CLOUDINARY_URL"] ?? Environment.GetEnvironmentVariable("CLOUDINARY_URL");
            if (string.IsNullOrWhiteSpace(url))
            {
                throw new InvalidOperationException("CLOUDINARY_URL is not configured.");
            }
            _cloudinary = new Cloudinary(url);
            _cloudinary.Api.Secure = true;
            _logger = logger;
        }

        public async Task<string?> SaveAsync(IFormFile file, string subfolder, string[] allowedTypes, long maxBytes)
        {
            if (file.Length == 0 || file.Length > maxBytes)
            {
                return null;
            }

            if (!allowedTypes.Contains(file.ContentType))
            {
                return null;
            }

            try
            {
                using var stream = file.OpenReadStream();
                var isVideo = file.ContentType.StartsWith("video/");

                RawUploadResult result;
                if (isVideo)
                {
                    var uploadParams = new VideoUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = $"textile-machine/{subfolder}",
                    };
                    result = await _cloudinary.UploadAsync(uploadParams);
                }
                else
                {
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = $"textile-machine/{subfolder}",
                    };
                    result = await _cloudinary.UploadAsync(uploadParams);
                }

                if (result.Error != null)
                {
                    _logger.LogError("Cloudinary upload failed: {Error}", result.Error.Message);
                    return null;
                }

                return result.SecureUrl?.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Cloudinary upload threw an exception");
                return null;
            }
        }
    }
}
