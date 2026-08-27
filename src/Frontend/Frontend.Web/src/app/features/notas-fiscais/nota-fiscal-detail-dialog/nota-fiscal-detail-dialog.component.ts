import { Component, computed, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NotaFiscal } from '../../../core/models/nota-fiscal.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

export interface NotaFiscalDetailDialogData {
  notaFiscal: NotaFiscal;
}

@Component({
  selector: 'app-nota-fiscal-detail-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    StatusBadgeComponent
  ],
  template: `
    <div class="dialog-header">
      <div class="header-info">
        <span class="nf-number-badge">NF #{{ data.notaFiscal.id }}</span>
        <h2 mat-dialog-title class="dialog-title">Detalhes da Nota Fiscal</h2>
      </div>
      <app-status-badge tipo="nota-fiscal" [ativo]="data.notaFiscal.ativo"></app-status-badge>
    </div>

    <mat-dialog-content class="dialog-content">
      <!-- Summary Info Cards -->
      <div class="summary-cards">
        <div class="info-card">
          <span class="info-card-label">Número Sequencial</span>
          <span class="info-card-value">#{{ data.notaFiscal.id }}</span>
        </div>
        <div class="info-card">
          <span class="info-card-label">Situação</span>
          <span class="info-card-value">{{ data.notaFiscal.ativo ? 'Aberta / Ativa' : 'Fechada / Inativa' }}</span>
        </div>
        <div class="info-card">
          <span class="info-card-label">Tipos de Produtos</span>
          <span class="info-card-value">{{ (data.notaFiscal.itemNotaFiscal || []).length }}</span>
        </div>
        <div class="info-card">
          <span class="info-card-label">Volume Total</span>
          <span class="info-card-value">{{ volumeTotal() }} un</span>
        </div>
      </div>

      <mat-divider class="divider"></mat-divider>

      <!-- Products Table -->
      <h3 class="items-title">
        <mat-icon>inventory_2</mat-icon>
        <span>Itens Inclusos na Nota Fiscal</span>
      </h3>

      <div class="table-container">
        <table mat-table [dataSource]="data.notaFiscal.itemNotaFiscal || []" class="items-table">
          <!-- Código -->
          <ng-container matColumnDef="codigo">
            <th mat-header-cell *matHeaderCellDef>Código</th>
            <td mat-cell *matCellDef="let item">
              <span class="code-badge">{{ item.codigo }}</span>
            </td>
          </ng-container>

          <!-- Descrição -->
          <ng-container matColumnDef="descricao">
            <th mat-header-cell *matHeaderCellDef>Descrição do Produto</th>
            <td mat-cell *matCellDef="let item" class="desc-cell">
              {{ item.descricao }}
            </td>
          </ng-container>

          <!-- Quantidade -->
          <ng-container matColumnDef="quantidade">
            <th mat-header-cell *matHeaderCellDef class="qty-col">Quantidade</th>
            <td mat-cell *matCellDef="let item" class="qty-col">
              <span class="qty-badge">{{ item.quantidade }} un</span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="colunas"></tr>
          <tr mat-row *matRowDef="let row; columns: colunas"></tr>
        </table>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" [mat-dialog-close]="true">
        Fechar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 12px 24px;
    }
    .header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .nf-number-badge {
      background: #e2e8f0;
      color: #1e293b;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
      font-family: monospace;
    }
    .dialog-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }
    .dialog-content {
      padding: 12px 24px !important;
      min-width: 520px;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-card-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
    }
    .info-card-value {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
    }
    .divider {
      margin: 16px 0;
    }
    .items-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: #334155;
      margin: 0 0 12px 0;
    }
    .table-container {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .items-table {
      width: 100%;
    }
    .items-table th {
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      background: #f8fafc;
      padding: 10px 14px;
    }
    .items-table td {
      padding: 12px 14px;
      font-size: 14px;
    }
    .code-badge {
      font-family: monospace;
      font-weight: 600;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .desc-cell {
      font-weight: 500;
      color: #1e293b;
    }
    .qty-col {
      text-align: right;
    }
    .qty-badge {
      font-weight: 700;
      color: #0f172a;
    }
    mat-dialog-actions {
      padding: 16px 24px;
    }
  `]
})
export class NotaFiscalDetailDialogComponent {
  readonly data = inject<NotaFiscalDetailDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<NotaFiscalDetailDialogComponent>);

  readonly colunas = ['codigo', 'descricao', 'quantidade'];

  readonly volumeTotal = computed(() => {
    const itens = this.data?.notaFiscal?.itemNotaFiscal || [];
    return itens.reduce((acc, i) => acc + (i.quantidade || 0), 0);
  });
}
