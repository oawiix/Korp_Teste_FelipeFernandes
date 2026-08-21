using Microsoft.EntityFrameworkCore;
using Faturamento.Domain.Entities;
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
        modelBuilder.Entity<NotaFiscal>().HasKey(p => p.Id);
        modelBuilder.Entity<NotaFiscal>().Property(p => p.Ativo).IsRequired();
        modelBuilder.Entity<NotaFiscal>().Property(p => p.ItemNotaFiscal).IsRequired();
        
        modelBuilder.Entity<ItemNotaFiscal>().HasKey(p => p.Id);
        modelBuilder.Entity<ItemNotaFiscal>().Property(p => p.Codigo).IsRequired();
        modelBuilder.Entity<ItemNotaFiscal>().Property(p => p.Descricao).IsRequired();
        modelBuilder.Entity<ItemNotaFiscal>().Property(p => p.Saldo).IsRequired();
        
    }
}