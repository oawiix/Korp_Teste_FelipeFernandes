using Estoque.Application.Common;
using Estoque.Application.DTOs;

namespace Estoque.Application.Services;

public interface IProdutoService
{
    Task<Result<CriarProdutoDto>> CriarProdutoAsync(CriarProdutoDto produto,
        CancellationToken cancellationToken = default);
    Task BaixarEstoqueAsync(Guid produtoId, int quantidade,
        CancellationToken cancellationToken = default);
    Task<Result<ProdutoDto>> ObterProdutoPorIdAsync(Guid produtoId,
        CancellationToken cancellationToken = default);
    Task<Result<AtualizarProdutoDto>> AtualizarProdutoAsync(Guid produtoId, AtualizarProdutoDto produto,
        CancellationToken cancellationToken = default);
    Task<Result<ProdutoDto>> RemoverProdutoAsync(Guid produtoId,
        CancellationToken cancellationToken = default);
    
}