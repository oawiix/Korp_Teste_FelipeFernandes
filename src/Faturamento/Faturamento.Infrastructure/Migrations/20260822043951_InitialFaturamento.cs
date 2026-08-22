using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Faturamento.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialFaturamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "nota_fiscal",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_nota_fiscal", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "item_nota_fiscal",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    produto_id = table.Column<Guid>(type: "uuid", nullable: false),
                    codigo = table.Column<string>(type: "text", nullable: false),
                    descricao = table.Column<string>(type: "text", nullable: false),
                    saldo = table.Column<int>(type: "integer", nullable: false),
                    nota_fiscal_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_item_nota_fiscal", x => x.id);
                    table.ForeignKey(
                        name: "fk_item_nota_fiscal_nota_fiscal_nota_fiscal_id",
                        column: x => x.nota_fiscal_id,
                        principalTable: "nota_fiscal",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_item_nota_fiscal_nota_fiscal_id",
                table: "item_nota_fiscal",
                column: "nota_fiscal_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "item_nota_fiscal");

            migrationBuilder.DropTable(
                name: "nota_fiscal");
        }
    }
}
