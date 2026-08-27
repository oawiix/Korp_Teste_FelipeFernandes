export interface ItemNotaFiscal {
  id?: number;
  itemId?: string;
  produtoId?: string;
  codigo: string;
  descricao: string;
  quantidade: number;
}

export interface NotaFiscal {
  id: number;
  ativo: boolean;
  itemNotaFiscal: ItemNotaFiscal[];
}

export interface CriarItemNotaFiscalRequest {
  produtoId: string;
  codigo: string;
  descricao: string;
  quantidade: number;
}

export interface CriarNotaFiscalRequest {
  ativo: boolean;
  itemNotaFiscal: CriarItemNotaFiscalRequest[];
}

export interface AtualizarItemNotaFiscalRequest {
  id?: number;
  itemId: string;
  codigo: string;
  descricao: string;
  quantidade: number;
}

export interface AtualizarNotaFiscalRequest {
  id: number;
  ativo: boolean;
  itemNotaFiscal: AtualizarItemNotaFiscalRequest[];
}
