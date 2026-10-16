using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MtgTrader.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTradeProposalRespondedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "RespondedAt",
                table: "TradeProposals",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RespondedAt",
                table: "TradeProposals");
        }
    }
}
