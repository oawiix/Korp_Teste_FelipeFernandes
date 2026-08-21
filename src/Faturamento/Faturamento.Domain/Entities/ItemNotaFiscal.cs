namespace Faturamento.Domain.Entities;

public class ItemNotaFiscal
{
    public Guid ItemId { get; private set; }
    public string Codigo { get; private set; } = String.Empty;
    public string Descricao { get; private set; } = String.Empty;
    public int Saldo { get; private set; } = Int32.MinValue;

    public ItemNotaFiscal()
    {
    }

    public ItemNotaFiscal (Guid itemId, string codigo, string descricao, int saldoInicial)
    {
        ItemId = itemId;
        Codigo = codigo;
        Descricao = descricao;
        if(saldoInicial < 0) throw new ArgumentOutOfRangeException(nameof(saldoInicial));
        Saldo = saldoInicial;
    }
}