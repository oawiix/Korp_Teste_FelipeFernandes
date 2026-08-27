import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { AtualizarProdutoRequest, CriarProdutoRequest, Produto } from '../models/produto.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.estoqueApiUrl;

  // Signals
  readonly produtos = signal<Produto[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);

  // Computed signals
  readonly totalProdutos = computed(() => this.produtos().length);
  readonly totalEstoque = computed(() =>
    this.produtos().reduce((sum, p) => sum + (p.saldo ?? p.saldoInicial ?? 0), 0)
  );
  readonly produtosEstoqueBaixo = computed(() =>
    this.produtos().filter(p => (p.saldo ?? p.saldoInicial ?? 0) <= 5 && (p.saldo ?? p.saldoInicial ?? 0) > 0)
  );
  readonly produtosSemEstoque = computed(() =>
    this.produtos().filter(p => (p.saldo ?? p.saldoInicial ?? 0) === 0)
  );

  listar(): Observable<Produto[]> {
    this.carregando.set(true);
    this.erro.set(null);

    return this.http.get<ApiResponse<Produto[]>>(`${this.baseUrl}/Listar`).pipe(
      map(res => {
        const list = res.data ?? [];
        return list.map(p => ({
          ...p,
          saldo: p.saldo ?? p.saldoInicial ?? 0
        }));
      }),
      tap(produtos => {
        this.produtos.set(produtos);
        this.carregando.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.carregando.set(false);
        // Backend returns 400 when list is empty ("Nenhum produto disponivel.")
        if (error.status === 400 && error.error?.message?.toLowerCase().includes('nenhum produto')) {
          this.produtos.set([]);
          return of([]);
        }
        const msg = error.error?.message || 'Erro ao carregar lista de produtos.';
        this.erro.set(msg);
        return throwError(() => new Error(msg));
      })
    );
  }

  obterPorId(id: string): Observable<Produto> {
    return this.http.get<ApiResponse<Produto>>(`${this.baseUrl}/Estoque/Produtos/${id}`).pipe(
      map(res => ({
        ...res.data,
        saldo: res.data.saldo ?? res.data.saldoInicial ?? 0
      })),
      catchError((error: HttpErrorResponse) => {
        const msg = error.error?.message || 'Erro ao buscar produto.';
        return throwError(() => new Error(msg));
      })
    );
  }

  criar(dto: CriarProdutoRequest): Observable<Produto> {
    this.carregando.set(true);
    return this.http.post<any>(`${this.baseUrl}/Estoque/Produtos/CriarProduto`, dto).pipe(
      map(res => {
        const item = res.data ?? res;
        return {
          id: item.id,
          codigo: item.codigo,
          descricao: item.descricao,
          saldo: item.saldo ?? item.saldoInicial ?? 0,
          saldoInicial: item.saldoInicial ?? item.saldo ?? 0
        } as Produto;
      }),
      tap(() => {
        this.carregando.set(false);
        // Refresh products list to keep local state synchronized
        this.listar().subscribe();
      }),
      catchError((error: HttpErrorResponse) => {
        this.carregando.set(false);
        const msg = error.error?.message || error.error?.Message || 'Erro ao cadastrar produto.';
        return throwError(() => new Error(msg));
      })
    );
  }

  atualizar(id: string, dto: AtualizarProdutoRequest): Observable<Produto> {
    this.carregando.set(true);
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/Estoque/Produtos/${id}`, dto).pipe(
      map(res => res.data as Produto),
      tap(() => {
        this.carregando.set(false);
        this.listar().subscribe();
      }),
      catchError((error: HttpErrorResponse) => {
        this.carregando.set(false);
        const msg = error.error?.message || error.error?.Message || 'Erro ao atualizar produto.';
        return throwError(() => new Error(msg));
      })
    );
  }

  remover(id: string): Observable<void> {
    this.carregando.set(true);
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/Estoque/Produtos/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        this.carregando.set(false);
        this.produtos.update(lista => lista.filter(p => p.id !== id));
      }),
      catchError((error: HttpErrorResponse) => {
        this.carregando.set(false);
        const msg = error.error?.message || error.error?.Message || 'Erro ao excluir produto.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
