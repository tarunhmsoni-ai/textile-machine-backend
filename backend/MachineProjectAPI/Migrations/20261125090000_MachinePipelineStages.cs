using MachineProjectAPI.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MachineProjectAPI.Migrations
{
    // Hand-written (the EF tool is blocked on this PC); the model snapshot is updated to match.
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20261125090000_MachinePipelineStages")]
    public partial class MachinePipelineStages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(name: "UpdatedByUserId", table: "Machines", type: "int", nullable: true);
            migrationBuilder.CreateIndex(name: "IX_Machines_UpdatedByUserId", table: "Machines", column: "UpdatedByUserId");
            migrationBuilder.AddForeignKey(
                name: "FK_Machines_Users_UpdatedByUserId", table: "Machines", column: "UpdatedByUserId",
                principalTable: "Users", principalColumn: "Id", onDelete: ReferentialAction.SetNull);
            migrationBuilder.Sql("UPDATE Machines SET Status = 'Received' WHERE Status = 'Draft';");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_Machines_Users_UpdatedByUserId", table: "Machines");
            migrationBuilder.DropIndex(name: "IX_Machines_UpdatedByUserId", table: "Machines");
            migrationBuilder.DropColumn(name: "UpdatedByUserId", table: "Machines");
        }
    }
}
