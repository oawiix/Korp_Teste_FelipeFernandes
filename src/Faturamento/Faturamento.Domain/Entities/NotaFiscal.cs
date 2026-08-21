namespace Faturamento.Domain.Entities;

public class NotaFiscal
{
    public int Id { get; private set; }
    public bool Ativo { get; private set; } = true;
    public ICollection<ItemNotaFiscal> ItemNotaFiscal { get; private set; } = new List<ItemNotaFiscal>();

    public NotaFiscal()
    {
    }
    public NotaFiscal(int id, bool ativo, ICollection<ItemNotaFiscal> itemNotasFiscal)
    {
        Id = id;
        Ativo = ativo;
        ItemNotaFiscal = itemNotasFiscal;
    }
    public NotaFiscal(ICollection<ItemNotaFiscal> itemNotaFiscal)
    {
        ItemNotaFiscal = itemNotaFiscal;
    }
    public void AddItemToNotaFiscal(ItemNotaFiscal notaFiscal)
    {
        ItemNotaFiscal.Add(notaFiscal);
    }

    public void RemoveItemFromNotaFiscal(ItemNotaFiscal notaFiscal)
    {
        ItemNotaFiscal.Remove(notaFiscal);
    }
    
    public void Desativar()
    {
        Ativo = false;
    }

    public void Ativar()
    {
        Ativo = true;
    }

    public void SetItemNotasFiscal(ItemNotaFiscal item)
    {
        ItemNotaFiscal.Add(item);
    }

    public void Atualizar(bool ativo, ICollection<ItemNotaFiscal> itemNotasFiscal)
    {
        Ativo = ativo;
        ItemNotaFiscal = itemNotasFiscal;
    }
}
