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

    [HttpGet]
    public async Task<IActionResult> ObterNotaFiscalPorIdAsync([FromRoute]int id,
        CancellationToken cancellationToken = default)
    {
        {
            try
            {
                var result = await _notaFiscalService.ObterNotaFiscalPorIdAsync(id, cancellationToken);

                if (!result.IsSuccess)
                {
                    var responseError = new ResponseModel<NotaFiscalDto>(
                        data: default!,
                        Message: result.Error!,
                        Success: false,
                        TimeStamp: DateTime.UtcNow
                    );
                    return BadRequest(responseError);
                }

                var responseSuccess = new ResponseModel<NotaFiscalDto>(
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
    }
    
    
}