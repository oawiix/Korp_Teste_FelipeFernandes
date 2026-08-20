using Microsoft.EntityFrameworkCore;
using Estoque.Domain.Entities;

namespace Estoque.Infrastructure.Data;

public class EstoqueDbContext : DbContext
{
    public EstoqueDbContext(DbContextOptions<EstoqueDbContext> options) : base(options)
    {
        
        
    }
    
    public DbSet<Produto> Produtos { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
    
        optionsBuilder.UseSnakeCaseNamingConvention();
    }

    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Produto>().HasKey(p => p.Id);
        modelBuilder.Entity<Produto>().Property(p => p.Codigo).IsRequired();
        modelBuilder.Entity<Produto>().Property(p => p.Descricao).IsRequired();
    }
}