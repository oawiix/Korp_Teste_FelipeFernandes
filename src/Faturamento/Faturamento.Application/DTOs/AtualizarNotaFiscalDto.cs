namespace Faturamento.Application.DTOs;

public record AtualizarNotaFiscalDto
{
    public int Id { get;  init; }
    public bool Ativo { get;  init; } = true;
    public ICollection<ItemNotaFiscalDto> ItemNotasFiscal { get;  init; } = new List<ItemNotaFiscalDto>();
}