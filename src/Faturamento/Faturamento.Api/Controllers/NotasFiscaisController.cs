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
            try
            {
                var result = await _notaFiscalService.ObterNotaFiscalPorIdAsync(notaFiscalId, cancellationToken);

                if (!result.IsSuccess)
                {
                    var responseError = new ResponseModel<NotaFiscalDto>(
                        Data: default!,
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
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
    }

    [HttpGet("/Listar")]
    public async Task<IActionResult> ObterNotasFiscaisListAsync(CancellationToken cancellationToken = default)
    {
        {
            try
            {
                var result = await _notaFiscalService.ObterNotasFiscaisListAsync(cancellationToken);

                if (!result.IsSuccess)
                {
                    var responseError = new ResponseModel<IEnumerable<ObterNotasFiscaisListDto>>(
                        Data: default!,
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
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
    }
    
    
    [HttpDelete("{notaFiscalId:int}")]
    public async Task<IActionResult> RemoverNotaFiscalPorIdAsync([FromRoute]int notaFiscalId,
        CancellationToken cancellationToken = default)
    {
        {
            try
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
            catch (Exception ex)
            {
                return BadRequest(ex);
            }
        }
    }
    
    [HttpPut("{notaFiscalId:int}")]
    public async Task<IActionResult> AtualizarNotaFiscalPorIdAsync([FromRoute]int notaFiscalId,[FromBody] AtualizarNotaFiscalDto notaFiscal,
        CancellationToken cancellationToken = default)
    {
        {
            try
            {
                var verify = await _notaFiscalService.ObterNotaFiscalPorIdAsync(notaFiscalId, cancellationToken);
                if (!verify.IsSuccess)
                {
                    var responseError = new ResponseModel<AtualizarNotaFiscalDto>
                    (
                        Data: default!,
                        Message: "A Nota fiscal nao existe.",
                        Success: false,
                        TimeStamp: DateTime.Now
                    );
                    return BadRequest(responseError);
                }
                var result = await _notaFiscalService.AtualizarNotaFiscalPorIdAsync(notaFiscalId, notaFiscal, cancellationToken);
                var responseSuccess = new ResponseModel<AtualizarNotaFiscalDto>
                (
                    Data: result.Value!,
                    Message: "A Nota fiscal foi alterada com sucesso.",
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
    }
    
    [HttpPost("/Criar")]
    public async Task<IActionResult> CriarNotaFiscalAsync([FromBody] NotaFiscalDto notaFiscal,
        CancellationToken cancellationToken = default)
    {
        {
            try
            {
                var verify = await _notaFiscalService.CriarNotaFiscalAsync(notaFiscal, cancellationToken);
                if (!verify.IsSuccess)
                {
                    var responseError = new ResponseModel<NotaFiscalDto>
                    (
                        Data: default!,
                        Message: "A Nota fiscal nao existe.",
                        Success: false,
                        TimeStamp: DateTime.Now
                    );
                    return BadRequest(responseError);
                }
                var result = await _notaFiscalService.CriarNotaFiscalAsync(notaFiscal, cancellationToken);
                var responseSuccess = new ResponseModel<NotaFiscalDto>
                (
                    Data: result.Value!,
                    Message: "A Nota fiscal foi alterada com sucesso.",
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
    }
    
    
}