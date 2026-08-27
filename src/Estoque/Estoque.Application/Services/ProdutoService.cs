using Estoque.Application.Common;
using Estoque.Domain.Entities;
using Estoque.Domain.Repositories;
using Estoque.Application.DTOs;

namespace Estoque.Application.Services;

public class ProdutoService : IProdutoService
{
    private readonly IProdutoRepository _repository;

    public ProdutoService(IProdutoRepository produtoRepository)
    {
        _repository = produtoRepository;
    }

    public async Task<Result<IEnumerable<ProdutoDto>>> ObterProdutosListAsync(CancellationToken cancellationToken = default)
    {
        var produtosDb = await _repository
            .ObterProdutosListAsync(cancellationToken);
        var produtos = produtosDb.ToList();
        if(!produtos.Any()) return Result<IEnumerable<ProdutoDto>>.Failure("Nenhum produto disponivel.");
        
        var response = produtosDb.Select(p => new ProdutoDto(
            p!.Id,
            p.Codigo,
            p.Descricao,
            p.Saldo)).ToList()
            ;
        return Result<IEnumerable<ProdutoDto>>.Success(response);
    }
    
    public async Task<Result<CriarProdutoDto>> CriarProdutoAsync(CriarProdutoDto produto,
        CancellationToken cancellationToken = default)
    { 
        if (produto.SaldoInicial < 0) return Result<CriarProdutoDto>.Failure("Saldo inicial nao pode ser menor que zero.");
        
        var newProduto = new Produto(produto.Codigo, produto.Descricao, produto.SaldoInicial);
        await _repository.AdicionarAsync(newProduto, cancellationToken);
        
        var verifyProduto = await _repository.ObterProdutoPorIdAsync(newProduto.Id, cancellationToken);
        if (verifyProduto == null) return Result<CriarProdutoDto>.Failure("Erro ao criar produto");
        
        var responseProduto = new CriarProdutoDto(verifyProduto.Codigo, verifyProduto.Descricao, verifyProduto.Saldo);
        return Result<CriarProdutoDto>.Success(responseProduto);
    }

    public async Task<Result<ProdutoDto>> BaixarEstoqueAsync(Guid produtoId, int quantidade,
        CancellationToken cancellationToken = default)
    {
        var produtoDb = await _repository.ObterProdutoPorIdAsync(produtoId,  cancellationToken);
        if (produtoDb == null) return Result<ProdutoDto>.Failure("Produto nao encontrado para enviar evento.");
        produtoDb.AtualizarSaldo(quantidade);
        await _repository.AtualizarAsync(produtoDb, cancellationToken);
        var responseProduto = new ProdutoDto(produtoDb.Id, produtoDb.Codigo, produtoDb.Descricao, produtoDb.Saldo);
        return Result<ProdutoDto>.Success(responseProduto);
    }

    public async Task<Result<ProdutoDto>> ObterProdutoPorIdAsync(Guid produtoId,
        CancellationToken cancellationToken = default)
    {
        var produto = await _repository.ObterProdutoPorIdAsync(produtoId, cancellationToken);
        if (produto == null)
        {
            return Result<ProdutoDto>.Failure("Produto nao encontrado");
        }
        var response =  new ProdutoDto(produto.Id, produto.Codigo, produto.Descricao, produto.Saldo);
        return Result<ProdutoDto>.Success(response);
    }


    public async Task<Result<AtualizarProdutoDto>> AtualizarProdutoAsync(Guid produtoId, AtualizarProdutoDto produto,
        CancellationToken cancellationToken = default)
    {
        if (produto.novoSaldo < 0) return Result<AtualizarProdutoDto>.Failure("Saldo inicial nao pode ser menor que zero.");
            
        var oldProduto = await _repository.ObterProdutoPorIdAsync(produtoId, cancellationToken);
        if (oldProduto == null) return Result<AtualizarProdutoDto>.Failure("Produto nao encontrado");
        
        oldProduto.SetCodigo(produto.Codigo);
        oldProduto.SetDescricao(produto.Descricao);
        oldProduto.SetSaldoInicial(produto.novoSaldo);
        await _repository.AtualizarAsync(oldProduto, cancellationToken);
        
        var response = Result<AtualizarProdutoDto>.Success(produto);
        return response;
        
    }

    public async Task<Result<ProdutoDto>> RemoverProdutoAsync(Guid produtoId,
        CancellationToken cancellationToken = default)
    {
        //Verificar se existe o produto
        var query = await _repository.ObterProdutoPorIdAsync(produtoId, cancellationToken);
        if (query == null) return Result<ProdutoDto>.Failure("Produto nao encontrado");
        await _repository.RemoverAsync(produtoId, cancellationToken);
        var response = new ProdutoDto(query.Id, query.Codigo, query.Descricao, query.Saldo);
        return Result<ProdutoDto>.Success(response);
    }
}