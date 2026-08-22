namespace Korp.MessageContracts.Events;

public record NotaFiscalParaImpressaoEvent(int NotaFiscalId, List<ItemNotaFiscalDto> Itens);
public record ItemNotaFiscalDto(Guid ProdutoId, int Quantidade);