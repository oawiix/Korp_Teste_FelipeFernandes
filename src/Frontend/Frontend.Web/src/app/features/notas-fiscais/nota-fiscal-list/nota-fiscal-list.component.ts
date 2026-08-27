import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
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
import { NotaFiscal } from '../../../core/models/nota-fiscal.model';
import { NotaFiscalService } from '../../../core/services/nota-fiscal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotaFiscalDetailDialogComponent } from '../nota-fiscal-detail-dialog/nota-fiscal-detail-dialog.component';

@Component({
  selector: 'app-nota-fiscal-list',
  imports: [
    RouterLink,
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
    EmptyStateComponent,
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Notas Fiscais de Faturamento</h1>
          <p class="page-subtitle">Emissão, controle sequencial e gerenciamento do status das notas fiscais</p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button (click)="carregarNotas()" [disabled]="notaFiscalService.carregando()" class="action-btn">
            <mat-icon [class.spin]="notaFiscalService.carregando()">refresh</mat-icon>
            <span>Atualizar</span>
          </button>
          <button mat-flat-button color="primary" routerLink="/notas-fiscais/nova" class="action-btn">
            <mat-icon>add_circle</mat-icon>
            <span>Nova Nota Fiscal</span>
          </button>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="metrics-grid">
        <mat-card class="metric-card">
          <mat-card-content class="metric-content">
            <div class="metric-icon-bg bg-purple">
              <mat-icon>receipt_long</mat-icon>
            </div>
            <div class="metric-text">
              <span class="metric-label">Total de Notas Fiscais</span>
              <span class="metric-value">{{ notaFiscalService.totalNotas() }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content class="metric-content">
            <div class="metric-icon-bg bg-green">
              <mat-icon>check_circle_outline</mat-icon>
            </div>
            <div class="metric-text">
              <span class="metric-label">Notas Abertas (Ativas)</span>
              <span class="metric-value text-green">{{ notaFiscalService.totalAbertas() }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content class="metric-content">
            <div class="metric-icon-bg bg-gray">
              <mat-icon>lock_outline</mat-icon>
            </div>
            <div class="metric-text">
              <span class="metric-label">Notas Fechadas</span>
              <span class="metric-value text-gray">{{ notaFiscalService.totalFechadas() }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card">
          <mat-card-content class="metric-content">
            <div class="metric-icon-bg bg-blue">
              <mat-icon>local_shipping</mat-icon>
            </div>
            <div class="metric-text">
              <span class="metric-label">Volume Total Faturado</span>
              <span class="metric-value text-blue">{{ volumeTotalFaturado() }} un</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Card -->
      <mat-card class="main-card">
        <!-- Filter Bar -->
        <div class="filter-bar">
          <mat-form-field appearance="outline" class="search-field" subscriptSizing="dynamic">
            <mat-label>Buscar por número ou produto...</mat-label>
            <input
              matInput
              [value]="termoBusca()"
              (input)="onBuscaChange($event)"
              placeholder="Ex: #1 ou Teclado"
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
              [class.active-chip]="filtroStatus() === 'todas'"
              (click)="filtroStatus.set('todas')"
            >
              Todas ({{ notaFiscalService.totalNotas() }})
            </button>
            <button
              mat-stroked-button
              [class.active-chip]="filtroStatus() === 'abertas'"
              (click)="filtroStatus.set('abertas')"
            >
              Abertas ({{ notaFiscalService.totalAbertas() }})
            </button>
            <button
              mat-stroked-button
              [class.active-chip]="filtroStatus() === 'fechadas'"
              (click)="filtroStatus.set('fechadas')"
            >
              Fechadas ({{ notaFiscalService.totalFechadas() }})
            </button>
          </div>
        </div>

        <!-- Loading -->
        @if (notaFiscalService.carregando() && notasFiltradas().length === 0) {
          <div class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Carregando notas fiscais...</p>
          </div>
        }

        <!-- Empty State -->
        @if (!notaFiscalService.carregando() && notasFiltradas().length === 0) {
          @if (termoBusca() || filtroStatus() !== 'todas') {
            <app-empty-state
              icone="search_off"
              titulo="Nenhuma nota fiscal encontrada"
              descricao="Nenhuma nota fiscal corresponde aos filtros aplicados."
              textoBotao="Limpar Filtros"
              iconeBotao="clear_all"
              (acao)="limparFiltros()"
            ></app-empty-state>
          } @else {
            <app-empty-state
              icone="receipt_long"
              titulo="Nenhuma nota fiscal emitida"
              descricao="Crie uma nova nota fiscal para registrar a saída e movimentação de produtos."
              textoBotao="Emitir Primeira Nota Fiscal"
              iconeBotao="add_circle"
              (acao)="navegarNovaNota()"
            ></app-empty-state>
          }
        }

        <!-- Table -->
        @if (notasFiltradas().length > 0) {
          <div class="table-responsive">
            <table mat-table [dataSource]="notasFiltradas()" class="invoices-table">
              <!-- Numeração Sequencial -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>Número (Sequencial)</th>
                <td mat-cell *matCellDef="let nf">
                  <span class="nf-badge">NF #{{ nf.id }}</span>
                </td>
              </ng-container>

              <!-- Produtos / Itens -->
              <ng-container matColumnDef="itens">
                <th mat-header-cell *matHeaderCellDef>Itens Inclusos</th>
                <td mat-cell *matCellDef="let nf" class="items-cell">
                  <div class="items-summary">
                    <span class="items-count-badge">{{ (nf.itemNotaFiscal || []).length }} produto(s)</span>
                    <span class="items-preview">{{ formatarPreviewItens(nf) }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Volume Total -->
              <ng-container matColumnDef="volume">
                <th mat-header-cell *matHeaderCellDef>Volume Total</th>
                <td mat-cell *matCellDef="let nf">
                  <span class="volume-badge">{{ calcularVolume(nf) }} un</span>
                </td>
              </ng-container>

              <!-- Status -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Situação</th>
                <td mat-cell *matCellDef="let nf">
                  <app-status-badge tipo="nota-fiscal" [ativo]="nf.ativo"></app-status-badge>
                </td>
              </ng-container>

              <!-- Ações -->
              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef class="actions-header">Ações</th>
                <td mat-cell *matCellDef="let nf" class="actions-cell">
                  <!-- Visualizar Detalhes -->
                  <button
                    mat-icon-button
                    color="primary"
                    matTooltip="Visualizar Itens da Nota"
                    (click)="abrirDetalhes(nf)"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>

                  <!-- Alternar Status -->
                  <button
                    mat-icon-button
                    [matTooltip]="nf.ativo ? 'Fechar / Desativar Nota' : 'Reabrir / Ativar Nota'"
                    (click)="alternarStatus(nf)"
                  >
                    <mat-icon [class.text-green]="!nf.ativo" [class.text-gray]="nf.ativo">
                      {{ nf.ativo ? 'lock_outline' : 'lock_open' }}
                    </mat-icon>
                  </button>

                  <!-- Editar -->
                  <button
                    mat-icon-button
                    color="primary"
                    matTooltip="Editar Nota Fiscal"
                    [routerLink]="['/notas-fiscais/editar', nf.id]"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>

                  <!-- Excluir -->
                  <button
                    mat-icon-button
                    color="warn"
                    matTooltip="Excluir Nota Fiscal"
                    (click)="confirmarExclusao(nf)"
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
    .bg-purple { background: rgba(147, 51, 234, 0.12); color: #9333ea; }
    .bg-green { background: rgba(22, 163, 74, 0.12); color: #16a34a; }
    .bg-gray { background: rgba(100, 116, 139, 0.12); color: #64748b; }
    .bg-blue { background: rgba(37, 99, 235, 0.12); color: #2563eb; }
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
    .text-green { color: #16a34a !important; }
    .text-gray { color: #64748b !important; }
    .text-blue { color: #2563eb !important; }
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
      background-color: rgba(147, 51, 234, 0.12) !important;
      color: #9333ea !important;
      border-color: #9333ea !important;
      font-weight: 600;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .invoices-table {
      width: 100%;
      background: transparent;
    }
    .invoices-table th {
      font-weight: 600;
      color: #475569;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
      padding: 12px 16px;
    }
    .invoices-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .table-row:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
    .nf-badge {
      font-family: monospace;
      font-weight: 700;
      background: #ede9fe;
      color: #6d28d9;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 13px;
    }
    .items-cell {
      max-width: 380px;
    }
    .items-summary {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .items-count-badge {
      font-weight: 600;
      color: #1e293b;
      font-size: 13px;
    }
    .items-preview {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .volume-badge {
      font-weight: 700;
      color: #0f172a;
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
export class NotaFiscalListComponent implements OnInit {
  readonly notaFiscalService = inject(NotaFiscalService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly Router = inject(Router);

  readonly colunasExibidas = ['id', 'itens', 'volume', 'status', 'acoes'];
  readonly termoBusca = signal<string>('');
  readonly filtroStatus = signal<'todas' | 'abertas' | 'fechadas'>('todas');

  readonly volumeTotalFaturado = computed(() => {
    const list = this.notaFiscalService.notasFiscais();
    return list.reduce((total, nf) => {
      const sub = (nf.itemNotaFiscal || []).reduce((acc, i) => acc + (i.quantidade || 0), 0);
      return total + sub;
    }, 0);
  });

  readonly notasFiltradas = computed(() => {
    let lista = this.notaFiscalService.notasFiscais();
    const termo = this.termoBusca().trim().toLowerCase();

    if (termo) {
      lista = lista.filter(nf => {
        const idMatch = `#${nf.id}`.includes(termo) || `${nf.id}`.includes(termo);
        const itemMatch = (nf.itemNotaFiscal || []).some(
          i => i.codigo.toLowerCase().includes(termo) || i.descricao.toLowerCase().includes(termo)
        );
        return idMatch || itemMatch;
      });
    }

    const f = this.filtroStatus();
    if (f === 'abertas') {
      lista = lista.filter(nf => nf.ativo);
    } else if (f === 'fechadas') {
      lista = lista.filter(nf => !nf.ativo);
    }

    return lista;
  });

  ngOnInit(): void {
    this.carregarNotas();
  }

  carregarNotas(): void {
    this.notaFiscalService.listar().subscribe({
      error: (err) => this.notification.erro(err.message || 'Erro ao carregar notas fiscais.')
    });
  }

  onBuscaChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.termoBusca.set(val);
  }

  limparFiltros(): void {
    this.termoBusca.set('');
    this.filtroStatus.set('todas');
  }

  calcularVolume(nf: NotaFiscal): number {
    return (nf.itemNotaFiscal || []).reduce((acc, i) => acc + (i.quantidade || 0), 0);
  }

  formatarPreviewItens(nf: NotaFiscal): string {
    const itens = nf.itemNotaFiscal || [];
    if (itens.length === 0) return 'Nenhum produto';
    return itens.map(i => `${i.descricao} (${i.quantidade})`).join(', ');
  }

  navegarNovaNota(): void {
    this.Router.navigate(["/notas-fiscais/nova"]);
  }

  abrirDetalhes(nf: NotaFiscal): void {
    this.dialog.open(NotaFiscalDetailDialogComponent, {
      width: '640px',
      data: { notaFiscal: nf }
    });
  }

  alternarStatus(nf: NotaFiscal): void {
    this.notaFiscalService.alternarStatus(nf).subscribe({
      next: (atualizada) => {
        const novoStatus = atualizada.ativo ? 'Aberta' : 'Fechada';
        this.notification.sucesso(`Nota Fiscal #${nf.id} agora está ${novoStatus}.`);
      },
      error: (err) => {
        this.notification.erro(err.message || 'Erro ao alterar status da nota.');
      }
    });
  }

  confirmarExclusao(nf: NotaFiscal): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        titulo: 'Excluir Nota Fiscal',
        mensagem: `Deseja realmente remover a Nota Fiscal #${nf.id}? Esta ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
        textoCancelar: 'Cancelar',
        corConfirmar: 'warn',
        icone: 'delete_forever'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.notaFiscalService.remover(nf.id).subscribe({
          next: () => this.notification.sucesso(`Nota Fiscal #${nf.id} removida com sucesso!`),
          error: (err) => this.notification.erro(err.message || 'Erro ao excluir nota fiscal.')
        });
      }
    });
  }
}
