import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Produto } from '../../../core/models/produto.model';
import { ProdutoService } from '../../../core/services/produto.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProdutoFormDialogComponent } from '../produto-form-dialog/produto-form-dialog.component';

@Component({
  selector: 'app-produto-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Controle de Produtos e Estoque</h1>
          <p class="page-subtitle">Gerencie os produtos cadastrados e seus respectivos saldos de estoque</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="carregarProdutos()" [disabled]="produtoService.carregando()" class="action-btn">
            <mat-icon [class.spin]="produtoService.carregando()">refresh</mat-icon>
            <span>Atualizar</span>
          </button>
          <button mat-flat-button color="primary" (click)="abrirModalCriar()" class="action-btn">
            <mat-icon>add</mat-icon>
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="metrics-grid">
        <mat-card class="metric-card">
          <mat-card-content class="metric-content">
            <div class="metric-icon-bg bg-blue">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div class="metric-text">
              <span class="metric-label">Total de Produtos</span>
              <span class="metric-value">{{ produtoService.totalProdutos() }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content class="metric-content">
            <div class="metric-icon-bg bg-green">
              <mat-icon>assessment</mat-icon>
            </div>
            <div class="metric-text">
              <span class="metric-label">Volume Total em Estoque</span>
              <span class="metric-value">{{ produtoService.totalEstoque() }} un</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content class="metric-content">
            <div class="metric-icon-bg bg-amber">
              <mat-icon>warning_amber</mat-icon>
            </div>
            <div class="metric-text">
              <span class="metric-label">Estoque Baixo (≤ 5 un)</span>
              <span class="metric-value text-amber">{{ produtoService.produtosEstoqueBaixo().length }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content class="metric-content">
            <div class="metric-icon-bg bg-red">
              <mat-icon>error_outline</mat-icon>
            </div>
            <div class="metric-text">
              <span class="metric-label">Sem Estoque (0 un)</span>
              <span class="metric-value text-red">{{ produtoService.produtosSemEstoque().length }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Card -->
      <mat-card class="main-card">
        <!-- Filter Bar -->
        <div class="filter-bar">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-label>Buscar por código ou descrição</mat-label>
            <input
              matInput
              [value]="termoBusca()"
              (input)="onBuscaChange($event)"
              placeholder="Digite para filtrar..."
            />
            <mat-icon matPrefix>search</mat-icon>
            @if (termoBusca()) {
              <button mat-icon-button matSuffix (click)="termoBusca.set('')">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <!-- Filter Chips -->
          <div class="chips-filter">
            <button
              mat-stroked-button
              [class.active-chip]="filtroStatus() === 'todos'"
              (click)="filtroStatus.set('todos')"
            >
              Todos ({{ produtoService.totalProdutos() }})
            </button>
            <button
              mat-stroked-button
              [class.active-chip]="filtroStatus() === 'baixo'"
              (click)="filtroStatus.set('baixo')"
            >
              Estoque Baixo ({{ produtoService.produtosEstoqueBaixo().length }})
            </button>
            <button
              mat-stroked-button
              [class.active-chip]="filtroStatus() === 'zerado'"
              (click)="filtroStatus.set('zerado')"
            >
              Sem Estoque ({{ produtoService.produtosSemEstoque().length }})
            </button>
          </div>
        </div>

        <!-- Loading -->
        @if (produtoService.carregando() && produtosFiltrados().length === 0) {
          <div class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Carregando produtos...</p>
          </div>
        }

        <!-- Empty State -->
        @if (!produtoService.carregando() && produtosFiltrados().length === 0) {
          @if (termoBusca() || filtroStatus() !== 'todos') {
            <app-empty-state
              icone="search_off"
              titulo="Nenhum produto encontrado"
              descricao="Nenhum produto corresponde aos filtros aplicados."
              textoBotao="Limpar Filtros"
              iconeBotao="clear_all"
              (acao)="limparFiltros()"
            ></app-empty-state>
          } @else {
            <app-empty-state
              icone="inventory_2"
              titulo="Nenhum produto cadastrado"
              descricao="Cadastre seus produtos para gerenciar estoque e emitir notas fiscais."
              textoBotao="Cadastrar Primeiro Produto"
              iconeBotao="add"
              (acao)="abrirModalCriar()"
            ></app-empty-state>
          }
        }

        <!-- Table -->
        @if (produtosFiltrados().length > 0) {
          <div class="table-responsive">
            <table mat-table [dataSource]="produtosFiltrados()" class="products-table">
              <!-- Código -->
              <ng-container matColumnDef="codigo">
                <th mat-header-cell *matHeaderCellDef>Código</th>
                <td mat-cell *matCellDef="let p">
                  <span class="code-badge">{{ p.codigo }}</span>
                </td>
              </ng-container>

              <!-- Descrição -->
              <ng-container matColumnDef="descricao">
                <th mat-header-cell *matHeaderCellDef>Descrição</th>
                <td mat-cell *matCellDef="let p" class="description-cell">
                  <span class="produto-nome">{{ p.descricao }}</span>
                </td>
              </ng-container>

              <!-- Saldo / Quantidade -->
              <ng-container matColumnDef="saldo">
                <th mat-header-cell *matHeaderCellDef>Saldo Disponível</th>
                <td mat-cell *matCellDef="let p">
                  <span class="saldo-value" [class.saldo-zero]="(p.saldo ?? p.saldoInicial ?? 0) === 0">
                    {{ p.saldo ?? p.saldoInicial ?? 0 }} un
                  </span>
                </td>
              </ng-container>

              <!-- Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Situação</th>
                <td mat-cell *matCellDef="let p">
                  <app-status-badge tipo="estoque" [saldo]="p.saldo ?? p.saldoInicial ?? 0"></app-status-badge>
                </td>
              </ng-container>

              <!-- Ações -->
              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef class="actions-header">Ações</th>
                <td mat-cell *matCellDef="let p" class="actions-cell">
                  <button
                    mat-icon-button
                    color="primary"
                    matTooltip="Editar Produto"
                    (click)="abrirModalEditar(p)"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    matTooltip="Excluir Produto"
                    (click)="confirmarExclusao(p)"
                  >
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="colunasExibidas"></tr>
              <tr mat-row *matRowDef="let row; columns: colunasExibidas" class="table-row"></tr>
            </table>
          </div>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1280px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .page-title {
      font-size: 26px;
      font-weight: 700;
      color: var(--mat-sys-on-surface, #1e293b);
      margin: 0 0 6px 0;
    }
    .page-subtitle {
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant, #64748b);
      margin: 0;
    }
    .header-actions {
      display: flex;
      gap: 12px;
    }
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 42px;
      border-radius: 8px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric-card {
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .metric-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px !important;
    }
    .metric-icon-bg {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bg-blue { background: rgba(37, 99, 235, 0.12); color: #2563eb; }
    .bg-green { background: rgba(22, 163, 74, 0.12); color: #16a34a; }
    .bg-amber { background: rgba(217, 119, 6, 0.12); color: #d97706; }
    .bg-red { background: rgba(220, 38, 38, 0.12); color: #dc2626; }
    .metric-text {
      display: flex;
      flex-direction: column;
    }
    .metric-label {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .metric-value {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
    }
    .text-amber { color: #d97706; }
    .text-red { color: #dc2626; }
    .main-card {
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .search-field {
      flex: 1;
      min-width: 260px;
      max-width: 400px;
    }
    .chips-filter {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .chips-filter button {
      border-radius: 20px;
      font-size: 13px;
      height: 36px;
    }
    .active-chip {
      background-color: rgba(37, 99, 235, 0.12) !important;
      color: #2563eb !important;
      border-color: #2563eb !important;
      font-weight: 600;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .products-table {
      width: 100%;
      background: transparent;
    }
    .products-table th {
      font-weight: 600;
      color: #475569;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
      padding: 12px 16px;
    }
    .products-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .table-row:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
    .code-badge {
      font-family: monospace;
      font-weight: 600;
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 4px;
      color: #334155;
      font-size: 13px;
    }
    .produto-nome {
      font-weight: 500;
      color: #1e293b;
    }
    .saldo-value {
      font-weight: 600;
      color: #0f172a;
    }
    .saldo-zero {
      color: #dc2626;
    }
    .actions-header {
      text-align: right;
    }
    .actions-cell {
      text-align: right;
      white-space: nowrap;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 12px;
      color: #64748b;
    }
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ProdutoListComponent implements OnInit {
  readonly produtoService = inject(ProdutoService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  readonly colunasExibidas = ['codigo', 'descricao', 'saldo', 'status', 'acoes'];
  readonly termoBusca = signal<string>('');
  readonly filtroStatus = signal<'todos' | 'baixo' | 'zerado'>('todos');

  readonly produtosFiltrados = computed(() => {
    let lista = this.produtoService.produtos();
    const termo = this.termoBusca().trim().toLowerCase();

    if (termo) {
      lista = lista.filter(
        p => p.codigo.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo)
      );
    }

    const f = this.filtroStatus();
    if (f === 'baixo') {
      lista = lista.filter(p => (p.saldo ?? p.saldoInicial ?? 0) <= 5 && (p.saldo ?? p.saldoInicial ?? 0) > 0);
    } else if (f === 'zerado') {
      lista = lista.filter(p => (p.saldo ?? p.saldoInicial ?? 0) === 0);
    }

    return lista;
  });

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtoService.listar().subscribe({
      error: (err) => this.notification.erro(err.message || 'Erro ao carregar produtos.')
    });
  }

  onBuscaChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.termoBusca.set(val);
  }

  limparFiltros(): void {
    this.termoBusca.set('');
    this.filtroStatus.set('todos');
  }

  abrirModalCriar(): void {
    const ref = this.dialog.open(ProdutoFormDialogComponent, {
      width: '500px'
    });
    ref.afterClosed().subscribe(res => {
      if (res) this.carregarProdutos();
    });
  }

  abrirModalEditar(produto: Produto): void {
    const ref = this.dialog.open(ProdutoFormDialogComponent, {
      width: '500px',
      data: { produto }
    });
    ref.afterClosed().subscribe(res => {
      if (res) this.carregarProdutos();
    });
  }

  confirmarExclusao(produto: Produto): void {
    if (!produto.id) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titulo: 'Excluir Produto',
        mensagem: `Deseja realmente remover o produto "${produto.descricao}" (${produto.codigo})? Esta ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
        textoCancelar: 'Cancelar',
        corConfirmar: 'warn',
        icone: 'delete_forever'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (confirmado && produto.id) {
        this.produtoService.remover(produto.id).subscribe({
          next: () => this.notification.sucesso('Produto removido com sucesso!'),
          error: (err) => this.notification.erro(err.message || 'Erro ao excluir produto.')
        });
      }
    });
  }
}
