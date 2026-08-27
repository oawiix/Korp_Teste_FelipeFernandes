import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import {
  AtualizarNotaFiscalRequest,
  CriarNotaFiscalRequest,
  NotaFiscal
} from '../models/nota-fiscal.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotaFiscalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.faturamentoApiUrl;

  // Signals
  readonly notasFiscais = signal<NotaFiscal[]>([]);
  readonly carregando = signal<boolean>(false);
  readonly erro = signal<string | null>(null);

  // Computed signals
  readonly totalNotas = computed(() => this.notasFiscais().length);
  readonly totalAbertas = computed(() => this.notasFiscais().filter(n => n.ativo).length);
  readonly totalFechadas = computed(() => this.notasFiscais().filter(n => !n.ativo).length);

  listar(): Observable<NotaFiscal[]> {
    this.carregando.set(true);
    this.erro.set(null);

    return this.http.get<ApiResponse<NotaFiscal[]>>(`${this.baseUrl}/Listar`).pipe(
      map(res => res.data ?? []),
      tap(notas => {
        // Sort descending by ID (sequential numbering)
        const sorted = [...notas].sort((a, b) => b.id - a.id);
        this.notasFiscais.set(sorted);
        this.carregando.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.carregando.set(false);
        // Backend returns 400 when list is empty ("Não foi possivel obter as notas fiscais.")
        if (
          error.status === 400 &&
          (error.error?.message?.toLowerCase().includes('não foi possivel') ||
           error.error?.Message?.toLowerCase().includes('não foi possivel') ||
           error.error?.message?.toLowerCase().includes('nao foi possivel'))
        ) {
          this.notasFiscais.set([]);
          return of([]);
        }
        const msg = error.error?.message || error.error?.Message || 'Erro ao carregar notas fiscais.';
        this.erro.set(msg);
        return throwError(() => new Error(msg));
      })
    );
  }

  obterPorId(id: number): Observable<NotaFiscal> {
    return this.http.get<ApiResponse<NotaFiscal>>(`${this.baseUrl}/Faturamento/NotasFiscais/${id}`).pipe(
      map(res => res.data),
      catchError((error: HttpErrorResponse) => {
        const msg = error.error?.message || error.error?.Message || 'Erro ao buscar nota fiscal.';
        return throwError(() => new Error(msg));
      })
    );
  }

  criar(dto: CriarNotaFiscalRequest): Observable<NotaFiscal> {
    this.carregando.set(true);
    return this.http.post<ApiResponse<NotaFiscal>>(`${this.baseUrl}/Criar`, dto).pipe(
      map(res => res.data),
      tap(() => {
        this.carregando.set(false);
        this.listar().subscribe();
      }),
      catchError((error: HttpErrorResponse) => {
        this.carregando.set(false);
        const msg = error.error?.message || error.error?.Message || 'Erro ao criar nota fiscal.';
        return throwError(() => new Error(msg));
      })
    );
  }

  atualizar(id: number, dto: AtualizarNotaFiscalRequest): Observable<NotaFiscal> {
    this.carregando.set(true);
    return this.http.put<ApiResponse<NotaFiscal>>(`${this.baseUrl}/Faturamento/NotasFiscais/${id}`, dto).pipe(
      map(res => res.data),
      tap(() => {
        this.carregando.set(false);
        this.listar().subscribe();
      }),
      catchError((error: HttpErrorResponse) => {
        this.carregando.set(false);
        const msg = error.error?.message || error.error?.Message || 'Erro ao atualizar nota fiscal.';
        return throwError(() => new Error(msg));
      })
    );
  }

  alternarStatus(nota: NotaFiscal): Observable<NotaFiscal> {
    const atualizado: AtualizarNotaFiscalRequest = {
      id: nota.id,
      ativo: !nota.ativo,
      itemNotaFiscal: (nota.itemNotaFiscal || []).map(i => ({
        id: i.id,
        itemId: i.itemId || i.produtoId || '',
        codigo: i.codigo,
        descricao: i.descricao,
        quantidade: i.quantidade
      }))
    };
    return this.atualizar(nota.id, atualizado);
  }

  remover(id: number): Observable<void> {
    this.carregando.set(true);
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/Faturamento/NotasFiscais/${id}`).pipe(
      map(() => void 0),
      tap(() => {
        this.carregando.set(false);
        this.notasFiscais.update(lista => lista.filter(n => n.id !== id));
      }),
      catchError((error: HttpErrorResponse) => {
        this.carregando.set(false);
        const msg = error.error?.message || error.error?.Message || 'Erro ao excluir nota fiscal.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
