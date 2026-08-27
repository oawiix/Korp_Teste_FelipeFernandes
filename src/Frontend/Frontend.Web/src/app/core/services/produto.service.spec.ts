import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProdutoService } from './produto.service';
import { environment } from '../../../environments/environment';
import { CriarProdutoRequest, Produto } from '../models/produto.model';

describe('ProdutoService', () => {
  let service: ProdutoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProdutoService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProdutoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list products and update signals', () => {
    const mockProdutos: Produto[] = [
      { id: '11111111-1111-1111-1111-111111111111', codigo: 'P1', descricao: 'Prod 1', saldo: 10 },
      { id: '22222222-2222-2222-2222-222222222222', codigo: 'P2', descricao: 'Prod 2', saldo: 3 }
    ];

    service.listar().subscribe(produtos => {
      expect(produtos.length).toBe(2);
      expect(produtos[0].codigo).toBe('P1');
    });

    const req = httpMock.expectOne(`${environment.estoqueApiUrl}/Listar`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockProdutos, message: 'Produtos encontrados.', success: true, timeStamp: '2026-08-23' });

    expect(service.produtos().length).toBe(2);
    expect(service.totalProdutos()).toBe(2);
    expect(service.totalEstoque()).toBe(13);
    expect(service.produtosEstoqueBaixo().length).toBe(1); // saldo <= 5
  });

  it('should handle 400 empty list gracefully', () => {
    service.listar().subscribe(produtos => {
      expect(produtos).toEqual([]);
      expect(service.produtos()).toEqual([]);
    });

    const req = httpMock.expectOne(`${environment.estoqueApiUrl}/Listar`);
    req.flush(
      { data: null, message: 'Nenhum produto disponivel.', success: false, timeStamp: '2026-08-23' },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(service.produtos().length).toBe(0);
    expect(service.totalProdutos()).toBe(0);
  });

  it('should create product and refresh list', () => {
    const novo: CriarProdutoRequest = { codigo: 'P3', descricao: 'Prod 3', saldoInicial: 25 };

    service.criar(novo).subscribe(created => {
      expect(created.codigo).toBe('P3');
    });

    const createReq = httpMock.expectOne(`${environment.estoqueApiUrl}/Estoque/Produtos/CriarProduto`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush({ codigo: 'P3', descricao: 'Prod 3', saldoInicial: 25 });

    // Expect the automatic refresh call
    const listReq = httpMock.expectOne(`${environment.estoqueApiUrl}/Listar`);
    listReq.flush({ data: [{ id: '3', codigo: 'P3', descricao: 'Prod 3', saldoInicial: 25 }], message: 'ok', success: true });
  });

  it('should delete product and remove from signal', () => {
    service.produtos.set([
      { id: '11111111-1111-1111-1111-111111111111', codigo: 'P1', descricao: 'Prod 1', saldo: 10 }
    ]);

    service.remover('11111111-1111-1111-1111-111111111111').subscribe();

    const req = httpMock.expectOne(`${environment.estoqueApiUrl}/Estoque/Produtos/11111111-1111-1111-1111-111111111111`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Produto removido com sucesso.', success: true });

    expect(service.produtos().length).toBe(0);
  });
});
