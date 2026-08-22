using Estoque.Application.Services;
using Korp.MessageContracts.Events;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace Estoque.Infrastructure.Consumers; // ou Estoque.Application.Consumers

public class AtualizarEstoqueConsumer : IConsumer<NotaFiscalParaImpressaoEvent>
{
    private readonly ILogger<AtualizarEstoqueConsumer> _logger;
    private readonly IProdutoService _produtoService;

    public AtualizarEstoqueConsumer(ILogger<AtualizarEstoqueConsumer> logger, IProdutoService produtoService)
    {
        _logger = logger;
        _produtoService = produtoService;
    }

    public async Task Consume(ConsumeContext<NotaFiscalParaImpressaoEvent> context)
    {
        var mensagem = context.Message;
        _logger.LogInformation("Processando baixa de estoque para a nota: {NotaId}", mensagem.NotaFiscalId);

        foreach (var item in mensagem.Itens)
        {
            var produto = await _produtoService.BaixarEstoqueAsync(item.ProdutoId, item.Quantidade);

            if (produto.IsSuccess == false)
            {
                _logger.LogWarning("Produto com ID {ProdutoId} não encontrado no estoque.", item.ProdutoId);
                continue;
            }

            _logger.LogInformation("Estoque atualizado com sucesso para a nota: {NotaId}", mensagem.NotaFiscalId);
            await Task.CompletedTask;
        }
    }
}