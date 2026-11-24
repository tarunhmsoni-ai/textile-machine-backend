using MachineProjectAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MachineProjectAPI.Migrations
{
    // Hand-written (the EF tool is blocked on this PC); the model snapshot is updated to match.
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20261126090000_AddLeadOptionsAndPartnerCalls")]
    public partial class AddLeadOptionsAndPartnerCalls : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LeadMachineOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    LeadId = table.Column<int>(type: "int", nullable: false),
                    MachineId = table.Column<int>(type: "int", nullable: false),
                    Stage = table.Column<string>(type: "varchar(50)", nullable: false),
                    Notes = table.Column<string>(type: "longtext", nullable: false),
                    UpdatedByName = table.Column<string>(type: "longtext", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadMachineOptions", x => x.Id);
                    table.ForeignKey(name: "FK_LeadMachineOptions_Leads_LeadId", column: x => x.LeadId,
                        principalTable: "Leads", principalColumn: "Id", onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(name: "FK_LeadMachineOptions_Machines_MachineId", column: x => x.MachineId,
                        principalTable: "Machines", principalColumn: "Id", onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PartnerCalls",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    PartnerId = table.Column<int>(type: "int", nullable: false),
                    CalledOn = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Notes = table.Column<string>(type: "longtext", nullable: false),
                    CreatedByName = table.Column<string>(type: "longtext", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartnerCalls", x => x.Id);
                    table.ForeignKey(name: "FK_PartnerCalls_ReferralPartners_PartnerId", column: x => x.PartnerId,
                        principalTable: "ReferralPartners", principalColumn: "Id", onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(name: "IX_LeadMachineOptions_LeadId_MachineId", table: "LeadMachineOptions",
                columns: new[] { "LeadId", "MachineId" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_LeadMachineOptions_MachineId", table: "LeadMachineOptions", column: "MachineId");
            migrationBuilder.CreateIndex(name: "IX_PartnerCalls_PartnerId", table: "PartnerCalls", column: "PartnerId");

            // The lead pipeline now follows the client's document; map the two stages that were renamed.
            migrationBuilder.Sql("UPDATE Leads SET Status = 'Phone Call Done' WHERE Status = 'Contacted';");
            migrationBuilder.Sql("UPDATE Leads SET Status = 'Visit Planned' WHERE Status = 'Factory Visit';");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "LeadMachineOptions");
            migrationBuilder.DropTable(name: "PartnerCalls");
        }
    }
}
