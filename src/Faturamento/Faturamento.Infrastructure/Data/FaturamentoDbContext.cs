using Microsoft.EntityFrameworkCore;
using Faturamento.Domain.Entities;

namespace Faturamento.Infrastructure.Data;

public class FaturamentoDbContext : DbContext
{
    public FaturamentoDbContext(DbContextOptions<FaturamentoDbContext> options) : base(options)
    {
        
        
    }
    
    public DbSet<NotaFiscal> NotaFiscal { get; set; }
    public DbSet<ItemNotaFiscal> ItemNotaFiscal { get; set; }
    

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
    
        optionsBuilder.UseSnakeCaseNamingConvention();
    }

    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<NotaFiscal>(builder =>
        {
            builder.HasKey(n => n.Id);
            builder.Property(p => p.Ativo).IsRequired();
            builder.HasMany(n => n.ItemNotaFiscal)
                .WithOne()
                .HasForeignKey("NotaFiscalId")
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<ItemNotaFiscal>(builder =>
        {
            builder.HasKey(n => n.Id);
            builder.Property(p => p.ProdutoId).IsRequired();
            builder.Property(p => p.Codigo).IsRequired();
            builder.Property(p => p.Descricao).IsRequired();
            builder.Property(p =>p.Saldo).IsRequired();
        });

    }
}