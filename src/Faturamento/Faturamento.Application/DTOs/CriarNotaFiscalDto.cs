using System.Text.Json.Serialization;

namespace Faturamento.Application.DTOs;

public record CriarNotaFiscalDto
{
    [JsonIgnore]
    public int Id { get;  init; }
    public bool Ativo { get;  init; } = true;
    public ICollection<CriarItemNotaFiscalDto> ItemNotaFiscal { get;  init; } = new List<CriarItemNotaFiscalDto>();
}