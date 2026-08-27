import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { ProdutoService } from '../../core/services/produto.service';
import { NotaFiscalService } from '../../core/services/nota-fiscal.service';
import { NotificationService } from '../../core/services/notification.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProdutoFormDialogComponent } from '../produtos/produto-form-dialog/produto-form-dialog.component';
import {routes} from "../../app.routes";

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">Painel de Gestão ERP</h1>
            <p class="hero-subtitle">
              Visão integrada dos microsserviços de Estoque e Faturamento com mensageria assíncrona.
            </p>
          </div>
          <div class="hero-actions">
            <button mat-flat-button color="primary" class="hero-btn" (click)="abrirModalProduto()">
              <mat-icon>add_box</mat-icon>
              <span>Novo Produto</span>
            </button>
            <button mat-flat-button class="hero-btn btn-secondary" routerLink="/notas-fiscais/nova">
              <mat-icon>receipt</mat-icon>
              <span>Emitir Nota Fiscal</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Key KPI Metric Cards -->
      <div class="kpi-grid">
        <!-- Produtos Card -->
        <mat-card class="kpi-card" routerLink="/produtos">
          <mat-card-content class="kpi-content">
            <div class="kpi-icon-wrapper bg-blue">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-label">Produtos Cadastrados</span>
              <span class="kpi-value">{{ produtoService.totalProdutos() }}</span>
              <span class="kpi-sub">{{ produtoService.totalEstoque() }} unidades no estoque total</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Notas Abertas Card -->
        <mat-card class="kpi-card" routerLink="/notas-fiscais">
          <mat-card-content class="kpi-content">
            <div class="kpi-icon-wrapper bg-green">
              <mat-icon>receipt_long</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-label">Notas Abertas</span>
              <span class="kpi-value text-green">{{ notaFiscalService.totalAbertas() }}</span>
              <span class="kpi-sub">de {{ notaFiscalService.totalNotas() }} notas emitidas no total</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Notas Fechadas Card -->
        <mat-card class="kpi-card" routerLink="/notas-fiscais">
          <mat-card-content class="kpi-content">
            <div class="kpi-icon-wrapper bg-purple">
              <mat-icon>lock</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-label">Notas Fechadas</span>
              <span class="kpi-value text-purple">{{ notaFiscalService.totalFechadas() }}</span>
              <span class="kpi-sub">processadas e concluídas</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Alertas de Estoque Card -->
        <mat-card class="kpi-card" routerLink="/produtos">
          <mat-card-content class="kpi-content">
            <div class="kpi-icon-wrapper bg-amber">
              <mat-icon>notification_important</mat-icon>
            </div>
            <div class="kpi-data">
              <span class="kpi-label">Alertas de Estoque</span>
              <span class="kpi-value text-amber">{{ alertasEstoque() }}</span>
              <span class="kpi-sub">{{ produtoService.produtosSemEstoque().length }} sem estoque, {{ produtoService.produtosEstoqueBaixo().length }} baixos</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Tables Section -->
      <div class="tables-grid">
        <!-- Recent Products -->
        <mat-card class="table-card">
          <div class="card-header">
            <div class="card-header-title">
              <mat-icon color="primary">inventory</mat-icon>
              <h2>Produtos Recentes no Estoque</h2>
            </div>
            <button mat-button color="primary" routerLink="/produtos">
              <span>Ver Todos</span>
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>

          <mat-card-content class="table-content">
            @if (produtosRecentes().length === 0) {
              <app-empty-state
                icone="inventory_2"
                titulo="Nenhum produto cadastrado"
                descricao="Cadastre produtos para alimentar o estoque e vincular às notas."
                textoBotao="Cadastrar Produto"
                iconeBotao="add"
                (acao)="abrirModalProduto()"
              ></app-empty-state>
            } @else {
              <div class="table-responsive">
                <table mat-table [dataSource]="produtosRecentes()" class="dashboard-table">
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
                    <td mat-cell *matCellDef="let p" class="desc-cell">{{ p.descricao }}</td>
                  </ng-container>

                  <!-- Saldo -->
                  <ng-container matColumnDef="saldo">
                    <th mat-header-cell *matHeaderCellDef>Saldo</th>
                    <td mat-cell *matCellDef="let p">
                      <app-status-badge tipo="estoque" [saldo]="p.saldo ?? p.saldoInicial ?? 0"></app-status-badge>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="colunasProdutos"></tr>
                  <tr mat-row *matRowDef="let row; columns: colunasProdutos"></tr>
                </table>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <!-- Recent Invoices -->
        <mat-card class="table-card">
          <div class="card-header">
            <div class="card-header-title">
              <mat-icon color="primary">receipt</mat-icon>
              <h2>Últimas Notas Fiscais</h2>
            </div>
            <button mat-button color="primary" routerLink="/notas-fiscais">
              <span>Ver Todas</span>
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>

          <mat-card-content class="table-content">
            @if (notasRecentes().length === 0) {
              <app-empty-state
                icone="receipt_long"
                titulo="Nenhuma nota emitida"
                descricao="Emita notas fiscais para registrar saída de produtos do estoque."
                textoBotao="Nova Nota Fiscal"
                iconeBotao="add"
                (acao)="navegarNovaNota()"
              ></app-empty-state>
            } @else {
              <div class="table-responsive">
                <table mat-table [dataSource]="notasRecentes()" class="dashboard-table">
                  <!-- Número -->
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef>Número</th>
                    <td mat-cell *matCellDef="let nf">
                      <span class="nf-badge">NF #{{ nf.id }}</span>
                    </td>
                  </ng-container>

                  <!-- Itens -->
                  <ng-container matColumnDef="itens">
                    <th mat-header-cell *matHeaderCellDef>Produtos</th>
                    <td mat-cell *matCellDef="let nf" class="desc-cell">
                      {{ (nf.itemNotaFiscal || []).length }} item(ns) - {{ calcularVolume(nf) }} un
                    </td>
                  </ng-container>

                  <!-- Situação -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Situação</th>
                    <td mat-cell *matCellDef="let nf">
                      <app-status-badge tipo="nota-fiscal" [ativo]="nf.ativo"></app-status-badge>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="colunasNotas"></tr>
                  <tr mat-row *matRowDef="let row; columns: colunasNotas"></tr>
                </table>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .hero-section {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-radius: 16px;
      padding: 28px 32px;
      color: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .hero-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .hero-title {
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }
    .hero-subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
      max-width: 600px;
      line-height: 1.5;
    }
    .hero-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .hero-btn {
      height: 44px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 8px;
      font-weight: 600;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.12) !important;
      color: #ffffff !important;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
    .kpi-card {
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .kpi-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
    }
    .kpi-icon-wrapper {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bg-blue { background: rgba(37, 99, 235, 0.12); color: #2563eb; }
    .bg-green { background: rgba(22, 163, 74, 0.12); color: #16a34a; }
    .bg-purple { background: rgba(147, 51, 234, 0.12); color: #9333ea; }
    .bg-amber { background: rgba(217, 119, 6, 0.12); color: #d97706; }
    .kpi-data {
      display: flex;
      flex-direction: column;
    }
    .kpi-label {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .kpi-value {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.2;
      margin: 2px 0;
    }
    .kpi-sub {
      font-size: 12px;
      color: #94a3b8;
    }
    .text-green { color: #16a34a; }
    .text-purple { color: #9333ea; }
    .text-amber { color: #d97706; }
    .tables-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    @media (max-width: 960px) {
      .tables-grid {
        grid-template-columns: 1fr;
      }
    }
    .table-card {
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      padding: 16px 20px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .card-header-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-header-title h2 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .dashboard-table {
      width: 100%;
      background: transparent;
    }
    .dashboard-table th {
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .dashboard-table td {
      padding: 10px 12px;
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
    }
    .code-badge {
      font-family: monospace;
      font-weight: 600;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      color: #334155;
    }
    .nf-badge {
      font-family: monospace;
      font-weight: 700;
      background: #ede9fe;
      color: #6d28d9;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .desc-cell {
      font-weight: 500;
      color: #1e293b;
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly produtoService = inject(ProdutoService);
  readonly notaFiscalService = inject(NotaFiscalService);
  private readonly dialog = inject(MatDialog);
  private router = inject(Router);

  readonly colunasProdutos = ['codigo', 'descricao', 'saldo'];
  readonly colunasNotas = ['id', 'itens', 'status'];

  readonly produtosRecentes = computed(() => this.produtoService.produtos().slice(0, 5));
  readonly notasRecentes = computed(() => this.notaFiscalService.notasFiscais().slice(0, 5));

  readonly alertasEstoque = computed(() => {
    return this.produtoService.produtosEstoqueBaixo().length + this.produtoService.produtosSemEstoque().length;
  });

  ngOnInit(): void {
    this.produtoService.listar().subscribe();
    this.notaFiscalService.listar().subscribe();
  }

  abrirModalProduto(): void {
    this.dialog.open(ProdutoFormDialogComponent, {
      width: '500px'
    });
  }

  navegarNovaNota(): void {
    this.router.navigate(["/notas-fiscais/nova"]);
    // routerLink handles this
  }

  calcularVolume(nf: any): number {
    return (nf.itemNotaFiscal || []).reduce((acc: number, i: any) => acc + (i.quantidade || 0), 0);
  }
}
