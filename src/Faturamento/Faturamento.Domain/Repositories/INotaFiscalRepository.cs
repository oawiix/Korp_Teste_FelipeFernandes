using Faturamento.Domain.Entities;

namespace Faturamento.Domain.Repositories;

public interface INotaFiscalRepository
{
    Task<NotaFiscal?> ObterNotaFiscalPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<NotaFiscal?>> ObterNotasFiscaisListAsync(CancellationToken cancellationToken = default);
    Task<NotaFiscal?> RemoverNotaFiscalPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<NotaFiscal?> AtualizarNotaFiscalPorIdAsync(int id, bool ativo, List<ItemNotaFiscal> itemNotaFiscal, CancellationToken cancellationToken = default);
    Task<NotaFiscal?> CriarNotaFiscalAsync(NotaFiscal notaFiscal, CancellationToken cancellationToken = default);
    
}