namespace Faturamento.Application.DTOs;

public record ItemNotaFiscalDto
{
    public int Id { get;  init; }
    public Guid ItemId { get;  init; }
    public string Codigo { get;  init; } = String.Empty;
    public string Descricao { get;  init; } = String.Empty;
    public int Quantidade { get;  init; } = Int32.MinValue;
}