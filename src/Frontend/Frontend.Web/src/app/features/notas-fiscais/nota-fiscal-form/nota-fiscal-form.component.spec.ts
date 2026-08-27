import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NotaFiscalFormComponent } from './nota-fiscal-form.component';
import { ProdutoService } from '../../../core/services/produto.service';
import { NotaFiscalService } from '../../../core/services/nota-fiscal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Produto } from '../../../core/models/produto.model';
import { NotaFiscal } from '../../../core/models/nota-fiscal.model';

describe('NotaFiscalFormComponent', () => {
  let component: NotaFiscalFormComponent;
  let fixture: ComponentFixture<NotaFiscalFormComponent>;
  let produtoService: ProdutoService;
  let notaFiscalService: NotaFiscalService;
  let notificationService: NotificationService;

  const mockProdutos: Produto[] = [
    { id: '1', codigo: 'PROD-01', descricao: 'Teclado Gamer', saldo: 10, saldoInicial: 10 },
    { id: '2', codigo: 'PROD-02', descricao: 'Mouse sem Fio', saldo: 3, saldoInicial: 3 },
    { id: '3', codigo: 'PROD-03', descricao: 'Monitor 24', saldo: 0, saldoInicial: 0 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotaFiscalFormComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    produtoService = TestBed.inject(ProdutoService);
    notaFiscalService = TestBed.inject(NotaFiscalService);
    notificationService = TestBed.inject(NotificationService);

    // Mock produtoService.listar to return mock products and populate signal
    vi.spyOn(produtoService, 'listar').mockReturnValue(of(mockProdutos));
    produtoService.produtos.set(mockProdutos);

    fixture = TestBed.createComponent(NotaFiscalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Stock Balance Limits on Product Selection', () => {
    it('should set max validator and limit according to product stock when selecting a product', () => {
      const teclado = mockProdutos[0]; // saldo = 10
      component.onProdutoSelecionadoChange(teclado);
      component.itemForm.patchValue({ produtoSelecionado: teclado });

      expect(component.saldoDisponivelSelecionado()).toBe(10);
      expect(component.itemForm.get('quantidade')?.value).toBe(1);

      // Typing quantity within limit (5) should be valid
      component.itemForm.patchValue({ quantidade: 5 });
      component.onQuantidadeInput();
      expect(component.itemForm.get('quantidade')?.valid).toBe(true);
      expect(component.estoqueSuficienteAviso()).toBe(false);

      // Typing quantity exceeding limit (15) should be invalid
      component.itemForm.patchValue({ quantidade: 15 });
      component.onQuantidadeInput();
      expect(component.itemForm.get('quantidade')?.hasError('max')).toBe(true);
      expect(component.estoqueSuficienteAviso()).toBe(true);
    });

    it('should handle product with 0 stock by setting max validator to 0 and making form invalid', () => {
      const monitor = mockProdutos[2]; // saldo = 0
      component.onProdutoSelecionadoChange(monitor);
      component.itemForm.patchValue({ produtoSelecionado: monitor });

      expect(component.saldoDisponivelSelecionado()).toBe(0);
      expect(component.itemForm.get('quantidade')?.value).toBe(0);
      expect(component.itemForm.invalid).toBe(true);
    });

    it('should discount quantity already added to invoice from available balance', () => {
      const mouse = mockProdutos[1]; // saldo = 3
      component.itemForm.patchValue({ produtoSelecionado: mouse, quantidade: 2 });
      component.adicionarItem();

      expect(component.itensArray.length).toBe(1);
      expect(component.itensArray.at(0).get('quantidade')?.value).toBe(2);

      // Select mouse again to add more
      component.onProdutoSelecionadoChange(mouse);
      component.itemForm.patchValue({ produtoSelecionado: mouse });

      // Available should now be 3 - 2 = 1
      expect(component.saldoDisponivelSelecionado()).toBe(1);

      // Typing 2 should now exceed the remaining limit of 1
      component.itemForm.patchValue({ quantidade: 2 });
      component.onQuantidadeInput();
      expect(component.itemForm.get('quantidade')?.hasError('max')).toBe(true);
      expect(component.estoqueSuficienteAviso()).toBe(true);
    });
  });

  describe('Adicionar Item Validation', () => {
    it('should not allow adding an item if quantity exceeds available stock', () => {
      const notifySpy = vi.spyOn(notificationService, 'erro');
      const mouse = mockProdutos[1]; // saldo = 3

      component.itemForm.patchValue({ produtoSelecionado: mouse, quantidade: 10 });
      component.adicionarItem();

      expect(component.itensArray.length).toBe(0);
      expect(notifySpy).toHaveBeenCalled();
    });

    it('should update existing item quantity when adding the same product and validate total limit', () => {
      const teclado = mockProdutos[0]; // saldo = 10

      // Add 4 units
      component.itemForm.patchValue({ produtoSelecionado: teclado, quantidade: 4 });
      component.adicionarItem();
      expect(component.itensArray.length).toBe(1);
      expect(component.itensArray.at(0).get('quantidade')?.value).toBe(4);

      // Add 3 more units of the same product
      component.itemForm.patchValue({ produtoSelecionado: teclado, quantidade: 3 });
      component.adicionarItem();
      expect(component.itensArray.length).toBe(1);
      expect(component.itensArray.at(0).get('quantidade')?.value).toBe(7);

      // Try to add 5 more (7 + 5 = 12 > 10)
      const notifySpy = vi.spyOn(notificationService, 'erro');
      component.itemForm.patchValue({ produtoSelecionado: teclado, quantidade: 5 });
      component.adicionarItem();
      expect(component.itensArray.at(0).get('quantidade')?.value).toBe(7);
      expect(notifySpy).toHaveBeenCalled();
    });
  });

  describe('Stepper and Table Row Quantity Changes', () => {
    it('should increment and decrement item quantity within stock limits', () => {
      const teclado = mockProdutos[0]; // saldo = 10
      component.itemForm.patchValue({ produtoSelecionado: teclado, quantidade: 5 });
      component.adicionarItem();

      // Increment
      component.alterarQuantidadeItem(0, 1);
      expect(component.itensArray.at(0).get('quantidade')?.value).toBe(6);

      // Decrement
      component.alterarQuantidadeItem(0, -1);
      expect(component.itensArray.at(0).get('quantidade')?.value).toBe(5);

      // Stepper cannot exceed maximum (10)
      component.alterarQuantidadeItem(0, 10);
      expect(component.itensArray.at(0).get('quantidade')?.value).toBe(10);

      // Stepper cannot decrease below 1
      component.alterarQuantidadeItem(0, -20);
      expect(component.itensArray.at(0).get('quantidade')?.value).toBe(1);
    });

    it('should invalidate form and flag error if row input is manually typed above maximum', () => {
      const mouse = mockProdutos[1]; // saldo = 3
      component.itemForm.patchValue({ produtoSelecionado: mouse, quantidade: 2 });
      component.adicionarItem();

      // Manually set quantity to 5 in the table row
      component.itensArray.at(0).patchValue({ quantidade: 5 });
      component.onItemQuantidadeChange(0);

      expect(component.itensArray.at(0).get('quantidade')?.hasError('max')).toBe(true);
      expect(component.hasItensComEstoqueExcedido()).toBe(true);
      expect(component.form.invalid).toBe(true);
    });
  });

  describe('Edit Mode with Existing Invoice', () => {
    it('should calculate limits taking into account original quantities in the invoice', () => {
      const mockNF: NotaFiscal = {
        id: 100,
        ativo: true,
        itemNotaFiscal: [
          { produtoId: '1', codigo: 'PROD-01', descricao: 'Teclado Gamer', quantidade: 4 }
        ]
      };

      vi.spyOn(notaFiscalService, 'obterPorId').mockReturnValue(of(mockNF));
      component.carregarNotaParaEdicao(100);

      // In Estoque, PROD-01 has current saldo = 10.
      // In NF #100, it already had 4 units.
      // Total limit for this invoice = 10 + 4 = 14.
      expect(component.obterLimiteTotalDoProduto('PROD-01')).toBe(14);
      expect(component.obterSaldoMaximoDoItem(0)).toBe(14);

      // Currently 4 are in the item list, so remaining available to add is 14 - 4 = 10
      const teclado = mockProdutos[0];
      expect(component.obterSaldoDisponivelParaInclusao(teclado)).toBe(10);
    });
  });
});
