using Faturamento.Application.DTOs;
using Faturamento.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Faturamento.Api.Controllers;

[ApiController]
[Route("Faturamento/[controller]")]
public class NotasFiscaisController : ControllerBase
{
    private readonly INotaFiscalService _notaFiscalService;

    public NotasFiscaisController(INotaFiscalService notaFiscalService)
    {
        _notaFiscalService = notaFiscalService;
    }

    [HttpGet("{notaFiscalId:int}")]
    public async Task<IActionResult> ObterNotaFiscalPorIdAsync([FromRoute]int notaFiscalId,
        CancellationToken cancellationToken = default)
    {
        {
                var result = await _notaFiscalService.ObterNotaFiscalPorIdAsync(notaFiscalId, cancellationToken);

                if (!result.IsSuccess)
                {
                    var responseError = new ResponseModel<NotaFiscalDto>(
                        Data: null!,
                        Message: result.Error!,
                        Success: false,
                        TimeStamp: DateTime.UtcNow
                    );
                    return BadRequest(responseError);
                }

                var responseSuccess = new ResponseModel<NotaFiscalDto>(
                    Data: result.Value!,
                    Message: "Nota fiscal obtida com sucesso.",
                    Success: true,
                    TimeStamp: DateTime.Now
                );
                return Ok(responseSuccess);
        }
    }

    [HttpGet("/Listar")]
    public async Task<IActionResult> ObterNotasFiscaisListAsync(CancellationToken cancellationToken = default)
    {
        {
                var result = await _notaFiscalService.ObterNotasFiscaisListAsync(cancellationToken);

                if (!result.IsSuccess)
                {
                    var responseError = new ResponseModel<IEnumerable<ObterNotasFiscaisListDto>>(
                        Data: null!,
                        Message: result.Error!,
                        Success: false,
                        TimeStamp: DateTime.UtcNow
                    );
                    return BadRequest(responseError);
                }

                var responseSuccess = new ResponseModel<IEnumerable<ObterNotasFiscaisListDto>>(
                    Data: result.Value!,
                    Message: "Notas fiscais listadas com sucesso.",
                    Success: true,
                    TimeStamp: DateTime.Now
                );
                return Ok(responseSuccess);
        }
    }
    
    
    [HttpDelete("{notaFiscalId:int}")]
    public async Task<IActionResult> RemoverNotaFiscalPorIdAsync([FromRoute]int notaFiscalId,
        CancellationToken cancellationToken = default)
    {
        {
                var result = await _notaFiscalService.
                    RemoverNotaFiscalPorIdAsync(notaFiscalId, cancellationToken);
                if (!result.IsSuccess)
                {
                    var responseError = new ResponseModel<RemoverNotaFiscalDto>
                    (
                        Data: default!,
                        Message: "A Nota fiscal nao existe.",
                        Success: false,
                        TimeStamp: DateTime.Now
                    );
                    return BadRequest(responseError);
                }

                var responseSuccess = new ResponseModel<RemoverNotaFiscalDto>
                (
                    Data: result.Value!,
                    Message: "A Nota fiscal foi removida.",
                    Success: true,
                    TimeStamp: DateTime.Now
                    );
                return Ok(responseSuccess);
        }
    }
    
    [HttpPut("{notaFiscalId:int}")]
    public async Task<IActionResult> AtualizarNotaFiscalPorIdAsync([FromRoute] int notaFiscalId, [FromBody] AtualizarNotaFiscalDto notaFiscal,
        CancellationToken cancellationToken = default)
    {
        var result = await _notaFiscalService.AtualizarNotaFiscalPorIdAsync(notaFiscalId, notaFiscal, cancellationToken);
        if (!result.IsSuccess)
        {
            var responseError = new ResponseModel<AtualizarNotaFiscalDto>
            (
                Data: null!,
                Message: result.Error ?? "A Nota fiscal não foi encontrada.",
                Success: false,
                TimeStamp: DateTime.Now
            );
            return BadRequest(responseError);
        }

        var responseSuccess = new ResponseModel<AtualizarNotaFiscalDto>
        (
            Data: result.Value!,
            Message: "A Nota fiscal foi alterada com sucesso.",
            Success: true,
            TimeStamp: DateTime.Now
        );
        return Ok(responseSuccess);
    }
    
    [HttpPost("/Criar")]
    public async Task<IActionResult> CriarNotaFiscalAsync([FromBody] CriarNotaFiscalDto notaFiscal,
        CancellationToken cancellationToken = default)
    {
        {
                var result = await _notaFiscalService.CriarNotaFiscalAsync(notaFiscal, cancellationToken);
                var responseSuccess = new ResponseModel<CriarNotaFiscalDto>
                (
                    Data: result.Value!,
                    Message: "A Nota fiscal foi criada com sucesso.",
                    Success: true,
                    TimeStamp: DateTime.Now
                );
                return Ok(responseSuccess);
        }
    }
    
    
}