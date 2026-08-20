namespace Estoque.Application.DTOs;

public record AtualizarProdutoDto(string Codigo, string Descricao, int novoSaldo);