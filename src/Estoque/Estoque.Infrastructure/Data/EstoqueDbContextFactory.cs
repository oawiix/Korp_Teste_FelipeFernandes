using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Estoque.Infrastructure.Data; 

public class EstoqueDbContextFactory : IDesignTimeDbContextFactory<EstoqueDbContext>
{
    public EstoqueDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<EstoqueDbContext>();
        
        // Esta connection string será usada APENAS para criar as migrations na sua máquina local.
        // O Docker vai continuar usando a connection string do seu appsettings / variáveis de ambiente.
        optionsBuilder.UseNpgsql("Host=localhost;Port=5434;Database=estoquedb;Username=postgres;Password=121415");

        return new EstoqueDbContext(optionsBuilder.Options);
    }
}