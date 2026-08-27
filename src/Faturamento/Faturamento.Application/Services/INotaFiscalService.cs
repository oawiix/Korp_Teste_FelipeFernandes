using Faturamento.Application.Common;
using Faturamento.Application.DTOs;

namespace Faturamento.Application.Services;

public interface INotaFiscalService
{
    Task<Result<NotaFiscalDto>> ObterNotaFiscalPorIdAsync(int id,
        CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<ObterNotasFiscaisListDto?>>> ObterNotasFiscaisListAsync(CancellationToken cancellationToken = default);
    Task<Result<RemoverNotaFiscalDto>> RemoverNotaFiscalPorIdAsync(int id,
        CancellationToken cancellationToken = default);
    Task<Result<AtualizarNotaFiscalDto>> AtualizarNotaFiscalPorIdAsync(int notaFiscalId, AtualizarNotaFiscalDto notaFiscal,
        CancellationToken cancellationToken = default);
    Task<Result<CriarNotaFiscalDto>> CriarNotaFiscalAsync(CriarNotaFiscalDto notaFiscal, CancellationToken cancellationToken = default);
}