
namespace Faturamento.Application.DTOs;

public class ObterNotasFiscaisListDto
{
    public int Id { get;  set; }
    public bool Ativo { get;  set; } = true;
    public ICollection<ItemNotaFiscalDto> ItemNotasFiscal { get;  set; } = new List<ItemNotaFiscalDto>();
}