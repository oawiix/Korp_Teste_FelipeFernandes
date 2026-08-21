using Faturamento.Domain.Entities;

namespace Faturamento.Domain.Repositories;

public interface INotaFiscalRepository
{
    Task<NotaFiscal?> ObterNotaFiscalPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<NotaFiscal?>> ObterNotasFiscaisListAsync(CancellationToken cancellationToken = default);
    Task<NotaFiscal?> RemoverNotaFiscalPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<NotaFiscal?> AtualizarNotaFiscalPorIdAsync(NotaFiscal notaFiscal, CancellationToken cancellationToken = default);
    
}