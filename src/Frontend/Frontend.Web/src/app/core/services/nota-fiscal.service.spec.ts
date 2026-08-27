import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NotaFiscalService } from './nota-fiscal.service';
import { environment } from '../../../environments/environment';
import { CriarNotaFiscalRequest, NotaFiscal } from '../models/nota-fiscal.model';

describe('NotaFiscalService', () => {
  let service: NotaFiscalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotaFiscalService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(NotaFiscalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list invoices and update signals', () => {
    const mockNotas: NotaFiscal[] = [
      {
        id: 1,
        ativo: true,
        itemNotaFiscal: [
          { codigo: 'P1', descricao: 'Prod 1', quantidade: 5 }
        ]
      },
      {
        id: 2,
        ativo: false,
        itemNotaFiscal: [
          { codigo: 'P2', descricao: 'Prod 2', quantidade: 2 }
        ]
      }
    ];

    service.listar().subscribe(notas => {
      expect(notas.length).toBe(2);
    });

    const req = httpMock.expectOne(`${environment.faturamentoApiUrl}/Listar`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockNotas, message: 'Notas fiscais listadas com sucesso.', success: true, timeStamp: '2026-08-23' });

    expect(service.notasFiscais().length).toBe(2);
    expect(service.totalNotas()).toBe(2);
    expect(service.totalAbertas()).toBe(1);
    expect(service.totalFechadas()).toBe(1);
  });

  it('should handle 400 empty list gracefully', () => {
    service.listar().subscribe(notas => {
      expect(notas).toEqual([]);
      expect(service.notasFiscais()).toEqual([]);
    });

    const req = httpMock.expectOne(`${environment.faturamentoApiUrl}/Listar`);
    req.flush(
      { data: null, message: 'Não foi possivel obter as notas fiscais.', success: false, timeStamp: '2026-08-23' },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(service.notasFiscais().length).toBe(0);
    expect(service.totalNotas()).toBe(0);
  });

  it('should create nota fiscal and refresh list', () => {
    const nova: CriarNotaFiscalRequest = {
      ativo: true,
      itemNotaFiscal: [
        { produtoId: '11111111-1111-1111-1111-111111111111', codigo: 'P1', descricao: 'Prod 1', quantidade: 3 }
      ]
    };

    service.criar(nova).subscribe(created => {
      expect(created.id).toBe(3);
    });

    const createReq = httpMock.expectOne(`${environment.faturamentoApiUrl}/Criar`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush({
      data: { id: 3, ativo: true, itemNotaFiscal: nova.itemNotaFiscal },
      message: 'Criada com sucesso',
      success: true
    });

    const listReq = httpMock.expectOne(`${environment.faturamentoApiUrl}/Listar`);
    listReq.flush({ data: [{ id: 3, ativo: true, itemNotaFiscal: [] }], message: 'ok', success: true });
  });

  it('should toggle status of nota fiscal', () => {
    const nota: NotaFiscal = {
      id: 5,
      ativo: true,
      itemNotaFiscal: [{ codigo: 'P1', descricao: 'Prod 1', quantidade: 1 }]
    };

    service.alternarStatus(nota).subscribe();

    const putReq = httpMock.expectOne(`${environment.faturamentoApiUrl}/Faturamento/NotasFiscais/5`);
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body.ativo).toBe(false);
    putReq.flush({
      data: { id: 5, ativo: false, itemNotaFiscal: nota.itemNotaFiscal },
      message: 'Alterada',
      success: true
    });

    const listReq = httpMock.expectOne(`${environment.faturamentoApiUrl}/Listar`);
    listReq.flush({ data: [{ id: 5, ativo: false, itemNotaFiscal: [] }], message: 'ok', success: true });
  });

  it('should delete nota fiscal and update signal', () => {
    service.notasFiscais.set([
      { id: 10, ativo: true, itemNotaFiscal: [] }
    ]);

    service.remover(10).subscribe();

    const delReq = httpMock.expectOne(`${environment.faturamentoApiUrl}/Faturamento/NotasFiscais/10`);
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush({ message: 'Removida', success: true });

    expect(service.notasFiscais().length).toBe(0);
  });
});
