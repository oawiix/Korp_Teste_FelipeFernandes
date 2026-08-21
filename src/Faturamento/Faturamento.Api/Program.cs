using Faturamento.Application.Services;
using Faturamento.Domain.Repositories;
using Faturamento.Infrastructure.Data;
using Faturamento.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

//PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<FaturamentoDbContext>(options =>
    options.UseNpgsql(connectionString).UseSnakeCaseNamingConvention());

//Dependencias
builder.Services.AddScoped<INotaFiscalRepository, NotaFiscalRepository>();
builder.Services.AddScoped<INotaFiscalService, NotaFiscalService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.MapControllers();

//Conectar ao banco e aplicar migrações.
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<FaturamentoDbContext>();
    var logger = services.GetRequiredService<ILogger<Program>>();
    
        int maxRetries = 5;
        int delayMs = 2000;

        for (int currentRetry = 1; currentRetry <= maxRetries; currentRetry++)
        {
            try
            {
                var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
                if (pendingMigrations.Any())
                {
                    logger.LogInformation($"Aplicando migrações... Tentativa {currentRetry}/{maxRetries}");
                    await context.Database.MigrateAsync(); 
                    logger.LogInformation("Migrações aplicadas com sucesso!");
                }
                break;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, $"Erro ao aplicar migração na tentativa {currentRetry}.");
            
                if (currentRetry == maxRetries)
                {
                    logger.LogError("Número máximo de tentativas atingido. Abortando a inicialização.");
                    throw;
                }
                await Task.Delay(delayMs);
            }
        }
    }




app.Run();

