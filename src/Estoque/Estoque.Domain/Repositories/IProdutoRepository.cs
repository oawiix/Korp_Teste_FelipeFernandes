using Estoque.Domain.Entities;

namespace Estoque.Domain.Repositories;

public interface IProdutoRepository
{
    Task<IReadOnlyCollection<Produto?>> ObterProdutosListAsync(CancellationToken cancellationToken = default);
    Task<Produto?>ObterProdutoPorIdAsync(Guid produtoId, CancellationToken cancellationToken = default);
    Task<Produto?> AdicionarAsync(Produto produto, CancellationToken cancellationToken = default);
    Task<Produto?> AtualizarAsync(Produto produto,  CancellationToken cancellationToken = default);
    Task<Produto?> RemoverAsync(Guid prudutoId, CancellationToken cancellationToken = default);
}