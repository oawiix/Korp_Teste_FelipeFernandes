using Estoque.Application.Common;
using Estoque.Application.DTOs;

namespace Estoque.Application.Services;

public interface IProdutoService
{
    Task<Result<IEnumerable<ProdutoDto>>> ObterProdutosListAsync(CancellationToken cancellationToken = default);
    Task<Result<CriarProdutoDto>> CriarProdutoAsync(CriarProdutoDto produto,
        CancellationToken cancellationToken = default);
    Task<Result<ProdutoDto>> BaixarEstoqueAsync(Guid produtoId, int quantidade,
        CancellationToken cancellationToken = default);
    Task<Result<ProdutoDto>> ObterProdutoPorIdAsync(Guid produtoIdString,
        CancellationToken cancellationToken = default);
    Task<Result<AtualizarProdutoDto>> AtualizarProdutoAsync(Guid produtoId, AtualizarProdutoDto produto,
        CancellationToken cancellationToken = default);
    Task<Result<ProdutoDto>> RemoverProdutoAsync(Guid produtoId,
        CancellationToken cancellationToken = default);
    
}