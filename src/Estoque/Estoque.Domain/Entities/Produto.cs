namespace Estoque.Domain.Entities;

public class Produto
{
    public Guid Id { get; private set; }
    public string Codigo { get; private set; } = String.Empty;
    public string Descricao { get; private set; } = String.Empty;
    public int Saldo { get; private set; } = Int32.MinValue;

    public Produto()
    {
    }

    public Produto (string codigo, string descricao, int saldoInicial)
    {
        Id = Guid.NewGuid();
        Codigo = codigo;
        Descricao = descricao;
        if(saldoInicial < 0) throw new ArgumentOutOfRangeException(nameof(saldoInicial));
        Saldo = saldoInicial;
    }

    public void SetCodigo(string codigo)
    {
        Codigo = codigo;
    }

    public void SetDescricao(string descricao)
    {
        Descricao = descricao;
    }

    public void SetSaldoInicial(int saldo)
    {
        Saldo = saldo;
    }
    public void AtualizarSaldo(int quantidadeUtilizada)
    {
        if (Saldo < quantidadeUtilizada) throw new InvalidOperationException("Saldo insuficiente.");
        Saldo -= quantidadeUtilizada;
    }

    public void AtualizarDescricao(string descricao)
    {
        Descricao = descricao;
    }

    public void AtualizarSaldoInicial(int novaQuantidade)
    {
        Saldo = novaQuantidade;
    }

    public void Atualizar(Produto produto)
    {
        Codigo = produto.Codigo;
        Descricao = produto.Descricao;
        Saldo = produto.Saldo;
    }
}