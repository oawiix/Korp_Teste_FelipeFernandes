namespace Faturamento.Application.DTOs;

public record NotaFiscalDto
{
    public int Id { get;  init; }
    public bool Ativo { get;  init; } = true;
    public ICollection<ItemNotaFiscalDto> ItemNotaFiscal { get;  init; } = new List<ItemNotaFiscalDto>();
}