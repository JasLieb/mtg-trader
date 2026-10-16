using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MtgTrader.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTradeProposals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TradeProposals",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    ProposerId = table.Column<string>(type: "text", nullable: false),
                    RecipientId = table.Column<string>(type: "text", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    State = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TradeProposals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TradeProposals_Users_ProposerId",
                        column: x => x.ProposerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TradeProposals_Users_RecipientId",
                        column: x => x.RecipientId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TradeProposalCards",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    TradeProposalId = table.Column<string>(type: "text", nullable: false),
                    CardId = table.Column<string>(type: "text", nullable: false),
                    GivenBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TradeProposalCards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TradeProposalCards_TradeProposals_TradeProposalId",
                        column: x => x.TradeProposalId,
                        principalTable: "TradeProposals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TradeProposalCards_TradeProposalId",
                table: "TradeProposalCards",
                column: "TradeProposalId");

            migrationBuilder.CreateIndex(
                name: "IX_TradeProposals_ProposerId",
                table: "TradeProposals",
                column: "ProposerId");

            migrationBuilder.CreateIndex(
                name: "IX_TradeProposals_RecipientId",
                table: "TradeProposals",
                column: "RecipientId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TradeProposalCards");

            migrationBuilder.DropTable(
                name: "TradeProposals");
        }
    }
}
