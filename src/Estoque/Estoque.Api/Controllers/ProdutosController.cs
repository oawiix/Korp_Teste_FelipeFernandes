using Estoque.Application.DTOs;
using Estoque.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Estoque.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProdutosController : ControllerBase
{
    private readonly IProdutoService _produtoService;

    public ProdutosController(IProdutoService produtoService)
    {
        _produtoService = produtoService;
    }

    [HttpPost("CriarProduto")]
    public async Task<IActionResult> CriarProdutoAsync([FromBody] CriarProdutoDto produto,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _produtoService.CriarProdutoAsync(produto, cancellationToken);

            if (!result.IsSuccess)
            {
                var responseError = new ResponseModel<CriarProdutoDto>(
                    data: default!,
                    Message: result.Error!,
                    Success: false,
                    TimeStamp: DateTime.UtcNow
                );
                return BadRequest(responseError);
            }

            var responseSuccess = new ResponseModel<CriarProdutoDto>(
                data: result.Value!,
                Message: "Produto criado com sucesso.",
                Success: true,
                TimeStamp: DateTime.Now
            );
            return Ok(responseSuccess);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
    

    [HttpGet("{produtoId}")]
    public async Task<IActionResult> ObterProdutoPorIdAsync([FromRoute]Guid produtoId, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _produtoService.ObterProdutoPorIdAsync(produtoId, cancellationToken);
            if (!result.IsSuccess)
            {
                var responseError = new ResponseModel<ProdutoDto>(
                    data: result.Value!,
                    Message: "Usuario nao encontrado.",
                    Success: false,
                    TimeStamp: DateTime.Now
                );
                return BadRequest(responseError);
            }

            var responseSuccess = new ResponseModel<ProdutoDto>(
                data: result.Value!,
                Message: "Usuario encontrado",
                Success: true,
                TimeStamp: DateTime.Now
            );
            return Ok(responseSuccess);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
    

    [HttpPut("{produtoId}", Name = "AtualizarProduto")]
    public async Task<IActionResult> AtualizarProdutoAsync([FromRoute]Guid produtoId, [FromBody]AtualizarProdutoDto produto,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await  _produtoService.AtualizarProdutoAsync(produtoId, produto, cancellationToken);
            if (!result.IsSuccess)
            {
                var responseError = new ResponseModel<AtualizarProdutoDto?>(
                    data: null,
                    Message: "Erro ao atualizar produto",
                    Success: false,
                    TimeStamp: DateTime.Now
                );
                return BadRequest(responseError);
            }
            var responseSuccess = new ResponseModel<AtualizarProdutoDto>(
                data: result.Value!,
                Message: "Produto atualizado com sucesso.",
                Success: true,
                TimeStamp: DateTime.Now
            );
            return Ok(responseSuccess);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpDelete("{produtoId}")]
    public async Task<IActionResult> RemoverProdutoAsync([FromRoute] Guid produtoId,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _produtoService.RemoverProdutoAsync(produtoId, cancellationToken);
            if (!result.IsSuccess)
            {
                var responseError = new ResponseModel<ProdutoDto?>(
                    data: null,
                    Message: "Erro ao remover produto",
                    Success: false,
                    TimeStamp: DateTime.Now
                );
                return NotFound(responseError);
            }
            
            var responseSuccess = new ResponseModel<ProdutoDto?>(
                data: result.Value!,
                Message: "Produto removido com sucesso.",
                Success: true,
                TimeStamp:DateTime.Now
            );
            return Ok(responseSuccess);
        }
        catch (Exception ex)
        {
            return NotFound(ex);
        }
    }
}