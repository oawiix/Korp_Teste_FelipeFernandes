namespace Estoque.Application.DTOs;

public record ProdutoDto(Guid Id, string Codigo, string Descricao, int SaldoInicial);