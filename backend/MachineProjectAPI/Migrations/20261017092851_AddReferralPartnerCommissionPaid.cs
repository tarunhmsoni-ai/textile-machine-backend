using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MachineProjectAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddReferralPartnerCommissionPaid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "TotalCommissionPaid",
                table: "ReferralPartners",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalCommissionPaid",
                table: "ReferralPartners");
        }
    }
}
