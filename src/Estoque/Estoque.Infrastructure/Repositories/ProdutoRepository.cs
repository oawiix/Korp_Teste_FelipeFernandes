using Estoque.Domain.Entities;
using Estoque.Domain.Repositories;
using Estoque.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Infrastructure.Repositories;

public class ProdutoRepository : IProdutoRepository
{
    private readonly EstoqueDbContext _context;

    public ProdutoRepository(EstoqueDbContext context)
    {
        _context = context;
    }

    public async Task<Produto?> ObterProdutoPorIdAsync(Guid produtoId, CancellationToken cancellationToken = default)
    {
        var produtoDb = await _context.Produtos.AsNoTracking().
            FirstOrDefaultAsync(p => p.Id == produtoId, cancellationToken);
        return produtoDb;
    }

    public async Task<Produto?> AdicionarAsync(Produto produto, CancellationToken cancellationToken = default)
    {
        await _context.Produtos.AddAsync(produto, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return produto;
    }

    public async Task<Produto?> AtualizarAsync(Produto produto, CancellationToken cancellationToken = default)
    {
        var produtoDb = await _context.Produtos.FirstOrDefaultAsync(p => p.Id == produto.Id,  cancellationToken);
        if(produtoDb == null) return null;
        produtoDb.Atualizar(produto);
        await _context.SaveChangesAsync(cancellationToken);
        return produtoDb;
    }

    public async Task<Produto?> RemoverAsync(Guid produtoId, CancellationToken cancellationToken = default)
    {
        var produtoDb = await _context.Produtos.FirstOrDefaultAsync(p => p.Id == produtoId, cancellationToken);
        if (produtoDb == null) return null;
         _context.Remove(produtoDb);
        await _context.SaveChangesAsync(cancellationToken);
        return produtoDb;
    }
}