using Estoque.Application.Services;
using Estoque.Infrastructure.Data;
using Korp.MessageContracts.Events;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Estoque.Infrastructure.Consumers; // ou Estoque.Application.Consumers

public class AtualizarEstoqueConsumer : IConsumer<NotaFiscalParaImpressaoEvent>
{
    private readonly ILogger<AtualizarEstoqueConsumer> _logger;
    private readonly EstoqueDbContext _dbContext;

    public AtualizarEstoqueConsumer(ILogger<AtualizarEstoqueConsumer> logger, EstoqueDbContext estoqueDbContext)
    {
        _logger = logger;
        _dbContext = estoqueDbContext;
    }

    public async Task Consume(ConsumeContext<NotaFiscalParaImpressaoEvent> context)
    {
        var mensagem = context.Message;
        _logger.LogInformation("Processando baixa de estoque para a nota: {NotaId}", mensagem.NotaFiscalId);

        foreach (var item in mensagem.Itens)
        {
            var produto = await _dbContext.Produtos.FindAsync(item.ProdutoId);

            if (produto == null)
            {
                _logger.LogWarning("Produto com ID {ProdutoId} não encontrado no estoque.", item.ProdutoId);
                continue;
            }
            produto.AtualizarSaldo(item.Quantidade);

            if (produto.Saldo < 0)
            {
                throw new InvalidOperationException($"Estoque insuficiente para o produto {produto.Codigo}. Saldo atual não permite a baixa.");
            }

            _dbContext.Produtos.Update(produto);
        }

        await _dbContext.SaveChangesAsync();
        
        _logger.LogInformation("Estoque atualizado com sucesso para a nota: {NotaId}", mensagem.NotaFiscalId);
        await Task.CompletedTask;
    }
}