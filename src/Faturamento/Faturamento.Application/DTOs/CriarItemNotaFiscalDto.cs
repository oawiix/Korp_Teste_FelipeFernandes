namespace Faturamento.Application.DTOs;

public record CriarItemNotaFiscalDto
{
    public Guid ProdutoId { get;  init; }
    public string Codigo { get;  init; } = String.Empty;
    public string Descricao { get;  init; } = String.Empty;
    public int Quantidade { get;  init; } = Int32.MinValue;
}