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

    public async Task<Result<CriarProdutoDto>> CriarProdutoAsync(CriarProdutoDto produto,
        CancellationToken cancellationToken = default)
    { 
        //Verifica se o saldo inicial é menor que 0
        if (produto.SaldoInicial < 0) return Result<CriarProdutoDto>.Failure("Saldo inicial nao pode ser menor que zero.");
        
        var newProduto = new Produto(produto.Codigo, produto.Descricao, produto.SaldoInicial);
        await _repository.AdicionarAsync(newProduto, cancellationToken);
        
        //Verificar se foi criado no banco
        var verifyProduto = await _repository.ObterProdutoPorIdAsync(newProduto.Id, cancellationToken);
        if (verifyProduto == null) return Result<CriarProdutoDto>.Failure("Erro ao criar produto");
        
        var responseProduto = new CriarProdutoDto(verifyProduto.Codigo, verifyProduto.Descricao, verifyProduto.Saldo);
        return Result<CriarProdutoDto>.Success(responseProduto);
    }

    public async Task BaixarEstoqueAsync(Guid produtoId, int quantidade,
        CancellationToken cancellationToken = default)
    {
        var produtoDb = await _repository.ObterProdutoPorIdAsync(produtoId,  cancellationToken);
        if (produtoDb == null) throw new Exception("Produto nao encontrado");
        
        produtoDb.AtualizarSaldo(quantidade);
    }

    public async Task<Result<ProdutoDto>> ObterProdutoPorIdAsync(Guid produtoId,
        CancellationToken cancellationToken = default)
    {
        var produto = await _repository.ObterProdutoPorIdAsync(produtoId, cancellationToken);
        if (produto == null)
        {
            return Result<ProdutoDto>.Failure("Produto nao encontrado");
        }
        var response =  new ProdutoDto(produto.Codigo, produto.Descricao, produto.Saldo);
        return Result<ProdutoDto>.Success(response);
    }


    public async Task<Result<AtualizarProdutoDto>> AtualizarProdutoAsync(Guid produtoId, AtualizarProdutoDto produto,
        CancellationToken cancellationToken = default)
    {
        if (produto.novoSaldo < 0) throw new Exception("Saldo nao pode ser menor que zero.");
            
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
        if (query == null) throw new Exception("Produto nao encontrado");
        await _repository.RemoverAsync(produtoId, cancellationToken);
        var response = new ProdutoDto(query.Codigo, query.Descricao, query.Saldo);
        return Result<ProdutoDto>.Success(response);
    }
}