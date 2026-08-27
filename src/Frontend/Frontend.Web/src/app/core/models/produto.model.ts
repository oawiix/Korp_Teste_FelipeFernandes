export interface Produto {
  id?: string;
  codigo: string;
  descricao: string;
  saldoInicial?: number;
  saldo?: number;
}

export interface CriarProdutoRequest {
  codigo: string;
  descricao: string;
  saldoInicial: number;
}

export interface AtualizarProdutoRequest {
  codigo: string;
  descricao: string;
  novoSaldo: number;
}
