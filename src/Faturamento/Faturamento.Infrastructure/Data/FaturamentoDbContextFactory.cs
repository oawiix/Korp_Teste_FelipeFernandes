using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Faturamento.Infrastructure.Data; 

public class FaturamentoDbContextFactory : IDesignTimeDbContextFactory<FaturamentoDbContext>
{
    public FaturamentoDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<FaturamentoDbContext>();
        
        // Esta connection string será usada APENAS para criar as migrations na sua máquina local.
        // O Docker vai continuar usando a connection string do seu appsettings / variáveis de ambiente.
        optionsBuilder.UseNpgsql("Host=localhost;Port=5435;Database=faturamentodb;Username=postgres;Password=121415");

        return new FaturamentoDbContext(optionsBuilder.Options);
    }
}