using MachineProjectAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MachineProjectAPI.Migrations
{
    // Hand-written (the EF tool is blocked on this PC); the model snapshot is updated to match.
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20261125120000_AddMarketingPosts")]
    public partial class AddMarketingPosts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MarketingPosts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MachineId = table.Column<int>(type: "int", nullable: false),
                    Channel = table.Column<string>(type: "varchar(100)", nullable: false),
                    PostedOn = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Notes = table.Column<string>(type: "longtext", nullable: false),
                    CreatedByName = table.Column<string>(type: "longtext", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketingPosts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarketingPosts_Machines_MachineId", column: x => x.MachineId,
                        principalTable: "Machines", principalColumn: "Id", onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(name: "IX_MarketingPosts_MachineId", table: "MarketingPosts", column: "MachineId");
            migrationBuilder.CreateIndex(name: "IX_MarketingPosts_PostedOn", table: "MarketingPosts", column: "PostedOn");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "MarketingPosts");
        }
    }
}
