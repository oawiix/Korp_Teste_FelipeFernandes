namespace Faturamento.Domain.Entities;

public class ItemNotaFiscal
{
    public int Id { get; private set; }
    public Guid ProdutoId { get; private set; }
    public string Codigo { get; private set; } = String.Empty;
    public string Descricao { get; private set; } = String.Empty;
    public int Saldo { get; private set; } = Int32.MinValue;

    public ItemNotaFiscal()
    {
    }

    public ItemNotaFiscal (Guid produtoId, string codigo, string descricao, int saldoInicial)
    {
        ProdutoId = produtoId;
        Codigo = codigo;
        Descricao = descricao;
        if(saldoInicial < 0) throw new ArgumentOutOfRangeException(nameof(saldoInicial));
        Saldo = saldoInicial;
    }
}