using MachineProjectAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MachineProjectAPI.Migrations
{
    // Hand-written (the EF tool is blocked on this PC); the model snapshot is updated to match.
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20261127090000_AddStageLogAndPartnerOutcome")]
    public partial class AddStageLogAndPartnerOutcome : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "Outcome", table: "PartnerCalls", type: "varchar(50)", nullable: false, defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "MachineStageLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MachineId = table.Column<int>(type: "int", nullable: false),
                    FromStatus = table.Column<string>(type: "longtext", nullable: false),
                    ToStatus = table.Column<string>(type: "longtext", nullable: false),
                    ByName = table.Column<string>(type: "longtext", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MachineStageLogs", x => x.Id);
                    table.ForeignKey(name: "FK_MachineStageLogs_Machines_MachineId", column: x => x.MachineId,
                        principalTable: "Machines", principalColumn: "Id", onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(name: "IX_MachineStageLogs_MachineId", table: "MachineStageLogs", column: "MachineId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "MachineStageLogs");
            migrationBuilder.DropColumn(name: "Outcome", table: "PartnerCalls");
        }
    }
}
