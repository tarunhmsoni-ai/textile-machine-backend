using Microsoft.EntityFrameworkCore;
using MachineProjectAPI.Models;

namespace MachineProjectAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Machine> Machines { get; set; } = null!;
        public DbSet<Lead> Leads { get; set; } = null!;
        public DbSet<LeadActivity> LeadActivities { get; set; } = null!;
        public DbSet<ReferralPartner> ReferralPartners { get; set; } = null!;
        public DbSet<KPI> KPIs { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Design-time fallback only (e.g. `dotnet ef migrations add` without DI config).
                var connectionString = "Host=localhost;Database=textilemachinedb;Username=postgres;Password=postgres;";
                optionsBuilder.UseNpgsql(connectionString);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configurations
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            // Machine relationships
            modelBuilder.Entity<Machine>()
                .HasOne(m => m.PostedByUser)
                .WithMany()
                .HasForeignKey(m => m.PostedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            // NoAction: combined with AssignedToUserId (direct, SetNull) and SoldMachineId below,
            // a SetNull here would give Leads a second cascading path into Users via
            // Machine.PostedByUserId — SQL Server rejects multiple cascade paths to one table.
            modelBuilder.Entity<Machine>()
                .HasMany(m => m.Leads)
                .WithOne(l => l.MatchedMachine)
                .HasForeignKey(l => l.MatchedMachineId)
                .OnDelete(DeleteBehavior.NoAction);

            // Lead relationships
            modelBuilder.Entity<Lead>()
                .HasOne(l => l.AssignedToUser)
                .WithMany()
                .HasForeignKey(l => l.AssignedToUserId)
                .OnDelete(DeleteBehavior.SetNull);

            // NoAction (not SetNull): Leads reaches Users via three paths (AssignedToUserId
            // directly, and indirectly through MatchedMachineId/SoldMachineId -> PostedByUserId),
            // and SQL Server rejects multiple cascade paths to the same table.
            modelBuilder.Entity<Lead>()
                .HasOne(l => l.SoldMachine)
                .WithMany()
                .HasForeignKey(l => l.SoldMachineId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Lead>()
                .HasOne(l => l.ReferralPartner)
                .WithMany(rp => rp.Leads)
                .HasForeignKey(l => l.ReferralPartnerId)
                .OnDelete(DeleteBehavior.SetNull);

            // LeadActivity relationships
            modelBuilder.Entity<LeadActivity>()
                .HasOne(la => la.Lead)
                .WithMany(l => l.Activities)
                .HasForeignKey(la => la.LeadId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LeadActivity>()
                .HasOne(la => la.CreatedByUser)
                .WithMany()
                .HasForeignKey(la => la.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Indexes
            modelBuilder.Entity<Machine>()
                .HasIndex(m => m.Status);

            modelBuilder.Entity<Machine>()
                .HasIndex(m => m.Type);

            modelBuilder.Entity<Lead>()
                .HasIndex(l => l.Status);

            modelBuilder.Entity<Lead>()
                .HasIndex(l => l.DateReceived);

            modelBuilder.Entity<LeadActivity>()
                .HasIndex(la => la.LeadId);

            modelBuilder.Entity<ReferralPartner>()
                .HasIndex(rp => rp.IsActive);
        }
    }
}
