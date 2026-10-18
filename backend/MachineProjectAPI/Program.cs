using System.Text;
using MachineProjectAPI.Data;
using MachineProjectAPI.Models;
using MachineProjectAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Machine Project API",
        Version = "v1",
        Description = "API for Machine Project Application"
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the JWT token returned by /api/auth/login (no need to type \"Bearer \").",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };
    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Add Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Auth services
builder.Services.AddScoped<TokenService>();

// Add OCR service for nameplate extraction
builder.Services.AddScoped<IOcrService, OcrService>();

// Durable file storage — Render's own disk is wiped on every deploy/restart
builder.Services.AddScoped<IUploadService, CloudinaryUploadService>();

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtSecretKey = jwtSection["SecretKey"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ClockSkew = TimeSpan.Zero,
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Machine Project API V1");
        c.RoutePrefix = string.Empty;
    });
}
// No UseHttpsRedirection() in production: Render terminates HTTPS at its edge
// and forwards plain HTTP to the container, so redirecting here would loop.

// Ensure wwwroot/uploads exists before wiring the static file provider — if the
// folder is missing at startup, ASP.NET Core binds a non-live provider and files
// written later (via uploads) never become servable even though they're saved.
var uploadsRoot = Path.Combine(
    string.IsNullOrEmpty(app.Environment.WebRootPath) ? Path.Combine(app.Environment.ContentRootPath, "wwwroot") : app.Environment.WebRootPath,
    "uploads");
Directory.CreateDirectory(Path.Combine(uploadsRoot, "photos"));
Directory.CreateDirectory(Path.Combine(uploadsRoot, "videos"));

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(app.Environment.ContentRootPath, "wwwroot")),
}); // serves wwwroot/uploads/* (machine photos & videos)
app.UseCors("AllowReactApp");
app.UseAuthentication();

// Staff tokens are only valid from a whitelisted office IP — checked on every
// request (not just login), so a token can't be lifted off the office network.
// Admin tokens are never restricted.
app.Use(async (context, next) =>
{
    if (context.User.Identity?.IsAuthenticated == true
        && context.User.IsInRole(UserRoles.Staff))
    {
        var db = context.RequestServices.GetRequiredService<ApplicationDbContext>();
        var clientIp = MachineProjectAPI.Services.ClientIpHelper.GetClientIp(context);
        var allowed = !string.IsNullOrEmpty(clientIp)
            && await db.StaffAccessIps.AnyAsync(w => w.IpAddress == clientIp);

        if (!allowed)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new
            {
                message = $"This session is no longer on a whitelisted office network ({clientIp ?? "unknown"}). Please log in again from the office.",
            });
            return;
        }
    }

    await next();
});

app.UseAuthorization();
app.MapControllers();

// Apply any pending EF Core migrations, then seed a default admin account
// (admin / admin123) if it doesn't exist yet. Migrate() creates the database
// and all tables on first run and is a no-op if already up to date, so this
// is safe to run on every startup on any machine.
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate();

        var adminUser = db.Users.FirstOrDefault(u => u.Username == "admin");
        if (adminUser == null)
        {
            var hasher = new PasswordHasher<User>();
            adminUser = new User { Username = "admin", FullName = "Administrator", Role = UserRoles.Admin };
            adminUser.PasswordHash = hasher.HashPassword(adminUser, "admin123");
            db.Users.Add(adminUser);
            db.SaveChanges();
        }
        else if (adminUser.Role != UserRoles.Admin)
        {
            // Backfills the Role column for the account that existed before
            // Role was introduced — the User.Role property defaults to
            // "Staff", which must never apply to the seeded admin account.
            adminUser.Role = UserRoles.Admin;
            db.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Could not apply database migrations or seed the default admin user.");
    }
}

app.Run();

