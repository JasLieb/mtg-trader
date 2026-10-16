using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MtgTrader.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTradeProposalRemovedCardsAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ProposerRemovedCardsAt",
                table: "TradeProposals",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RecipientRemovedCardsAt",
                table: "TradeProposals",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProposerRemovedCardsAt",
                table: "TradeProposals");

            migrationBuilder.DropColumn(
                name: "RecipientRemovedCardsAt",
                table: "TradeProposals");
        }
    }
}
