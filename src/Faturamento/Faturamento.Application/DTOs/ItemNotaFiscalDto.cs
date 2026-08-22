namespace Faturamento.Application.DTOs;

public record ItemNotaFiscalDto
{
    public Guid ItemId { get;  init; }
    public string Codigo { get;  init; } = String.Empty;
    public string Descricao { get;  init; } = String.Empty;
    public int Saldo { get;  init; } = Int32.MinValue;
}