namespace Faturamento.Application.DTOs;

public class ItemNotaFiscalDto
{
    public Guid Id { get;  set; }
    public string Codigo { get;  set; } = String.Empty;
    public string Descricao { get;  set; } = String.Empty;
    public int Saldo { get;  set; } = Int32.MinValue;
}