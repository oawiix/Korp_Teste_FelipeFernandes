namespace Korp.MessageContracts.Events;

public record NotaFiscalParaImpressaoEvent(Guid NotaFiscalId, List<ItemNotaFiscalDto> Itens);
public record ItemNotaFiscalDto(Guid ProdutoId, int Quantidade);