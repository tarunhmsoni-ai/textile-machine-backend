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
        public DbSet<Contact> Contacts { get; set; } = null!;
        public DbSet<StaffAccessIp> StaffAccessIps { get; set; } = null!;
        public DbSet<Subscriber> Subscribers { get; set; } = null!;
        public DbSet<MarketingPost> MarketingPosts { get; set; } = null!;
        public DbSet<LeadMachineOption> LeadMachineOptions { get; set; } = null!;
        public DbSet<PartnerCall> PartnerCalls { get; set; } = null!;
        public DbSet<MachineStageLog> MachineStageLogs { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Design-time fallback only (e.g. `dotnet ef migrations add` without DI config).
                var connectionString = "Server=localhost;Database=textilemachinedb;User=root;Password=;";
                optionsBuilder.UseMySql(connectionString, new MariaDbServerVersion(new Version(10, 11, 18)));
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

            modelBuilder.Entity<MarketingPost>(e =>
            {
                e.Property(p => p.Channel).HasMaxLength(100);
                e.HasIndex(p => p.PostedOn);
                e.HasOne(p => p.Machine).WithMany().HasForeignKey(p => p.MachineId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<LeadMachineOption>(e =>
            {
                e.Property(o => o.Stage).HasMaxLength(50);
                e.HasIndex(o => new { o.LeadId, o.MachineId }).IsUnique();
                e.HasOne(o => o.Lead).WithMany().HasForeignKey(o => o.LeadId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(o => o.Machine).WithMany().HasForeignKey(o => o.MachineId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PartnerCall>().Property(c => c.Outcome).HasMaxLength(50);

            modelBuilder.Entity<MachineStageLog>(e =>
            {
                e.HasIndex(l => l.MachineId);
                e.HasOne(l => l.Machine).WithMany().HasForeignKey(l => l.MachineId).OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PartnerCall>()
                .HasOne(c => c.Partner).WithMany().HasForeignKey(c => c.PartnerId).OnDelete(DeleteBehavior.Cascade);

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

            modelBuilder.Entity<Contact>()
                .HasIndex(c => c.ContactType);
        }
    }
}
