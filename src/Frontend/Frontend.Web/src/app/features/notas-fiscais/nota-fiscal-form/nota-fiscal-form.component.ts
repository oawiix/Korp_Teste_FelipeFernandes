import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Produto } from '../../../core/models/produto.model';
import { ProdutoService } from '../../../core/services/produto.service';
import { NotaFiscalService } from '../../../core/services/nota-fiscal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-nota-fiscal-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    StatusBadgeComponent
  ],
  template: `
    <div class="page-container">
      <!-- Breadcrumb & Header -->
      <div class="header-nav">
        <button mat-button routerLink="/notas-fiscais" class="back-link">
          <mat-icon>arrow_back</mat-icon>
          <span>Voltar para Notas Fiscais</span>
        </button>
      </div>

      <div class="page-header">
        <div>
          <h1 class="page-title">{{ isEdicao() ? 'Editar Nota Fiscal #' + notaId() : 'Nova Nota Fiscal' }}</h1>
          <p class="page-subtitle">
            {{ isEdicao() ? 'Atualize as informações e produtos da nota fiscal' : 'Emissão de nota fiscal com múltiplos produtos e numeração sequencial automática' }}
          </p>
        </div>
      </div>

      <div class="content-grid">
        <!-- Main Form Column -->
        <div class="main-column">
          <!-- Card: Dados Principais -->
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title class="card-title">
                <mat-icon color="primary">receipt</mat-icon>
                <span>Dados da Nota Fiscal</span>
              </mat-card-title>
            </mat-card-header>

            <mat-card-content class="card-content">
              <form [formGroup]="form">
                <div class="form-row">
                  <!-- Status (Aberta / Fechada) -->
                  <div class="status-toggle-wrapper">
                    <label class="toggle-label">Situação da Nota Fiscal:</label>
                    <mat-slide-toggle
                      formControlName="ativo"
                      color="primary"
                    >
                      <span class="status-toggle-text">
                        {{ form.get('ativo')?.value ? 'Aberta (Ativa)' : 'Fechada (Inativa)' }}
                      </span>
                    </mat-slide-toggle>
                    <span class="status-hint">
                      {{ form.get('ativo')?.value ? 'A nota está aberta para movimentação.' : 'A nota está marcada como fechada/concluída.' }}
                    </span>
                  </div>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <!-- Card: Inclusão de Produtos -->
          <mat-card class="form-card">
            <mat-card-header class="items-header">
              <mat-card-title class="card-title">
                <mat-icon color="primary">add_shopping_cart</mat-icon>
                <span>Adicionar Produtos à Nota Fiscal</span>
              </mat-card-title>
            </mat-card-header>

            <mat-card-content class="card-content">
              <!-- Add Item Form -->
              <div class="add-item-box" [formGroup]="itemForm">
                <div class="add-item-grid">
                  <!-- Produto Select -->
                  <mat-form-field appearance="outline" class="produto-select-field">
                    <mat-label>Selecione um Produto Cadastrado</mat-label>
                    <mat-select
                      formControlName="produtoSelecionado"
                      (selectionChange)="onProdutoSelecionadoChange($event.value)"
                    >
                      @for (p of produtosDisponiveis(); track p.id || p.codigo) {
                        @let disp = obterSaldoDisponivelParaInclusao(p);
                        <mat-option [value]="p">
                          <div class="option-item">
                            <span class="option-code">[{{ p.codigo }}]</span>
                            <span class="option-name">{{ p.descricao }}</span>
                            <span
                              class="option-stock"
                              [class.stock-zero]="disp <= 0"
                            >
                              @if (disp <= 0) {
                                Sem saldo disp. (Total: {{ obterLimiteTotalDoProduto(p.codigo) }})
                              } @else {
                                Disp: {{ disp }} un (Total: {{ obterLimiteTotalDoProduto(p.codigo) }})
                              }
                            </span>
                          </div>
                        </mat-option>
                      }
                    </mat-select>
                    <mat-icon matPrefix>inventory_2</mat-icon>
                  </mat-form-field>

                  <!-- Quantidade -->
                  <mat-form-field appearance="outline" class="qty-field">
                    <mat-label>Quantidade</mat-label>
                    <input
                      matInput
                      type="number"
                      min="1"
                      [max]="saldoDisponivelSelecionado()"
                      formControlName="quantidade"
                      placeholder="1"
                      (input)="onQuantidadeInput()"
                    />
                    <mat-icon matPrefix>format_list_numbered</mat-icon>
                    @if (produtoSelecionadoSignal() && saldoDisponivelSelecionado() > 0) {
                      <mat-hint>Máx: {{ saldoDisponivelSelecionado() }} un</mat-hint>
                    }
                    @if (itemForm.get('quantidade')?.hasError('required')) {
                      <mat-error>Quantidade é obrigatória.</mat-error>
                    }
                    @if (itemForm.get('quantidade')?.hasError('min')) {
                      <mat-error>Mínimo 1 unidade.</mat-error>
                    }
                    @if (itemForm.get('quantidade')?.hasError('max')) {
                      <mat-error>
                        @if (saldoDisponivelSelecionado() <= 0) {
                          Sem saldo disponível.
                        } @else {
                          Máx. permitido: {{ saldoDisponivelSelecionado() }} un.
                        }
                      </mat-error>
                    }
                  </mat-form-field>

                  <!-- Add Button -->
                  <div class="add-btn-wrapper">
                    <button
                      mat-flat-button
                      color="primary"
                      type="button"
                      (click)="adicionarItem()"
                      [disabled]="itemForm.invalid || !produtoSelecionadoSignal() || saldoDisponivelSelecionado() <= 0"
                      class="btn-add-item"
                    >
                      <mat-icon>add</mat-icon>
                      <span>Incluir Item</span>
                    </button>
                  </div>
                </div>

                <!-- Stock helper notice -->
                @if (produtoSelecionadoSignal()) {
                  <div
                    class="stock-notice"
                    [class.stock-warning]="estoqueSuficienteAviso()"
                    [class.stock-danger]="saldoDisponivelSelecionado() <= 0"
                  >
                    <mat-icon>{{ saldoDisponivelSelecionado() <= 0 ? 'block' : (estoqueSuficienteAviso() ? 'warning' : 'info') }}</mat-icon>
                    <span>
                      Produto selecionado: <strong>{{ produtoSelecionadoSignal()?.descricao }}</strong>
                      | Saldo em estoque: <strong>{{ obterLimiteTotalDoProduto(produtoSelecionadoSignal()?.codigo) }} un</strong>
                      @if (obterQuantidadeAlocadaNaNota(produtoSelecionadoSignal()?.codigo) > 0) {
                        | Já nesta nota: <strong>{{ obterQuantidadeAlocadaNaNota(produtoSelecionadoSignal()?.codigo) }} un</strong>
                      }
                      | <strong>Disponível para incluir: {{ saldoDisponivelSelecionado() }} unidades</strong>
                      @if (saldoDisponivelSelecionado() <= 0) {
                        - <em>Atenção: Saldo totalmente alocado ou zerado em estoque!</em>
                      } @else if (estoqueSuficienteAviso()) {
                        - <em>Atenção: A quantidade informada excede o saldo disponível!</em>
                      }
                    </span>
                  </div>
                }
              </div>

              <!-- List of Items in Invoice -->
              <div class="items-list-container">
                <div class="items-list-header">
                  <h3>Itens na Nota Fiscal ({{ itensArray.length }})</h3>
                  @if (itensArray.length > 0) {
                    <span class="total-units-badge">Volume Total: {{ totalUnidades() }} unidades</span>
                  }
                </div>

                @if (itensArray.length === 0) {
                  <div class="no-items-state">
                    <mat-icon class="no-items-icon">shopping_cart_checkout</mat-icon>
                    <p class="no-items-text">Nenhum produto incluído nesta nota fiscal ainda.</p>
                    <span class="no-items-sub">Selecione um produto e clique em "Incluir Item" para adicioná-lo.</span>
                  </div>
                } @else {
                  <div class="table-responsive">
                    <table class="items-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Código</th>
                          <th>Descrição</th>
                          <th class="text-center">Quantidade</th>
                          <th class="text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (item of itensArray.controls; track $index) {
                          <tr class="item-row">
                            <td class="index-cell">{{ $index + 1 }}</td>
                            <td>
                              <span class="code-badge">{{ item.get('codigo')?.value }}</span>
                            </td>
                            <td class="desc-cell">{{ item.get('descricao')?.value }}</td>
                            <td class="qty-cell">
                              <div class="qty-stepper-container">
                                <div class="qty-stepper" [formGroup]="$any(item)">
                                  <button
                                    mat-icon-button
                                    type="button"
                                    class="btn-step"
                                    matTooltip="Diminuir quantidade (-1)"
                                    [disabled]="(item.get('quantidade')?.value || 0) <= 1"
                                    (click)="alterarQuantidadeItem($index, -1)"
                                  >
                                    <mat-icon>remove</mat-icon>
                                  </button>

                                  <div class="qty-input-box">
                                    <input
                                      type="number"
                                      min="1"
                                      [max]="obterSaldoMaximoDoItem($index)"
                                      formControlName="quantidade"
                                      class="stepper-input"
                                      [class.input-error]="item.get('quantidade')?.invalid"
                                      (input)="onItemQuantidadeChange($index)"
                                    />
                                    <span class="qty-max-label">/ {{ obterSaldoMaximoDoItem($index) }} máx</span>
                                  </div>

                                  <button
                                    mat-icon-button
                                    type="button"
                                    class="btn-step"
                                    matTooltip="Aumentar quantidade (+1)"
                                    [disabled]="(item.get('quantidade')?.value || 0) >= obterSaldoMaximoDoItem($index)"
                                    (click)="alterarQuantidadeItem($index, 1)"
                                  >
                                    <mat-icon>add</mat-icon>
                                  </button>
                                </div>

                                @if (item.get('quantidade')?.hasError('max')) {
                                  <span class="row-error-msg">
                                    <mat-icon>error_outline</mat-icon>
                                    Excede o saldo máximo ({{ obterSaldoMaximoDoItem($index) }} un)
                                  </span>
                                }
                                @if (item.get('quantidade')?.hasError('min')) {
                                  <span class="row-error-msg">
                                    <mat-icon>error_outline</mat-icon>
                                    Mínimo 1 unidade
                                  </span>
                                }
                              </div>
                            </td>
                            <td class="actions-cell">
                              <button
                                mat-icon-button
                                color="warn"
                                matTooltip="Remover produto da nota"
                                (click)="removerItem($index)"
                              >
                                <mat-icon>delete_outline</mat-icon>
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Summary & Actions Sidebar -->
        <div class="sidebar-column">
          <mat-card class="summary-card">
            <mat-card-header>
              <mat-card-title class="card-title">
                <mat-icon color="primary">summarize</mat-icon>
                <span>Resumo da Emissão</span>
              </mat-card-title>
            </mat-card-header>

            <mat-card-content class="summary-content">
              <div class="summary-item">
                <span class="summary-label">Numeração</span>
                <span class="summary-val">{{ isEdicao() ? '#' + notaId() : 'Sequencial Automático' }}</span>
              </div>

              <div class="summary-item">
                <span class="summary-label">Situação</span>
                <app-status-badge tipo="nota-fiscal" [ativo]="form.get('ativo')?.value"></app-status-badge>
              </div>

              <div class="summary-item">
                <span class="summary-label">Produtos Distintos</span>
                <span class="summary-val">{{ itensArray.length }}</span>
              </div>

              <div class="summary-item total-item">
                <span class="summary-label">Volume Total</span>
                <span class="summary-val-large">{{ totalUnidades() }} un</span>
              </div>

              @if (itensArray.length === 0) {
                <div class="validation-warning">
                  <mat-icon>error_outline</mat-icon>
                  <span>Inclua pelo menos 1 produto para salvar a nota.</span>
                </div>
              }

              @if (hasItensComEstoqueExcedido()) {
                <div class="validation-warning validation-error">
                  <mat-icon>warning</mat-icon>
                  <span>Existem itens com quantidade superior ao saldo em estoque disponível.</span>
                </div>
              }
            </mat-card-content>

            <mat-divider></mat-divider>

            <div class="card-actions">
              <button
                mat-flat-button
                color="primary"
                class="save-btn"
                [disabled]="form.invalid || itensArray.length === 0 || salvando()"
                (click)="salvarNotaFiscal()"
              >
                @if (salvando()) {
                  <mat-spinner diameter="18" class="spinner"></mat-spinner>
                } @else {
                  <mat-icon>{{ isEdicao() ? 'save' : 'check_circle' }}</mat-icon>
                }
                <span>{{ salvando() ? 'Processando...' : (isEdicao() ? 'Salvar Alterações' : 'Emitir Nota Fiscal') }}</span>
              </button>

              <button
                mat-stroked-button
                routerLink="/notas-fiscais"
                class="cancel-btn"
                [disabled]="salvando()"
              >
                Cancelar
              </button>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1280px;
      margin: 0 auto;
    }
    .header-nav {
      margin-bottom: 12px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
    }
    .page-header {
      margin-bottom: 24px;
    }
    .page-title {
      font-size: 26px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 6px 0;
    }
    .page-subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 960px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }
    .main-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .form-card {
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      padding: 16px 20px;
    }
    .card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 17px;
      font-weight: 600;
      color: #1e293b;
    }
    .card-content {
      padding-top: 16px !important;
    }
    .status-toggle-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .toggle-label {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-toggle-text {
      font-size: 15px;
      font-weight: 600;
      margin-left: 8px;
    }
    .status-hint {
      font-size: 13px;
      color: #64748b;
    }
    .add-item-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .add-item-grid {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    .produto-select-field {
      flex: 2;
      min-width: 260px;
    }
    .qty-field {
      flex: 1;
      min-width: 130px;
      max-width: 180px;
    }
    .add-btn-wrapper {
      padding-bottom: 22px;
    }
    .btn-add-item {
      height: 48px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 8px;
      white-space: nowrap;
    }
    .option-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }
    .option-code {
      font-family: monospace;
      font-weight: 600;
      color: #2563eb;
    }
    .option-name {
      flex: 1;
    }
    .option-stock {
      font-size: 12px;
      color: #16a34a;
      font-weight: 600;
      background: rgba(22, 163, 74, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .stock-zero {
      color: #dc2626 !important;
      background: rgba(220, 38, 38, 0.1) !important;
    }
    .stock-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-top: 12px;
    }
    .stock-notice mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
      flex-shrink: 0;
    }
    .stock-warning {
      background: #fffbeb !important;
      border-color: #fde68a !important;
      color: #92400e !important;
    }
    .stock-danger {
      background: #fef2f2 !important;
      border-color: #fecaca !important;
      color: #991b1b !important;
    }
    .items-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .items-list-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: #334155;
      margin: 0;
    }
    .total-units-badge {
      background: #e2e8f0;
      color: #334155;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 12px;
    }
    .no-items-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 36px 16px;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      text-align: center;
    }
    .no-items-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .no-items-text {
      font-size: 15px;
      font-weight: 600;
      color: #475569;
      margin: 0 0 4px 0;
    }
    .no-items-sub {
      font-size: 13px;
      color: #94a3b8;
    }
    .table-responsive {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table th {
      background: #f8fafc;
      padding: 10px 14px;
      font-size: 12px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .items-table td {
      padding: 12px 14px;
      font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .index-cell {
      color: #94a3b8;
      font-weight: 600;
      width: 30px;
    }
    .code-badge {
      font-family: monospace;
      font-weight: 600;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      color: #334155;
    }
    .desc-cell {
      font-weight: 500;
      color: #1e293b;
    }
    .qty-cell {
      text-align: center;
      width: 220px;
    }
    .qty-stepper-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .qty-stepper {
      display: inline-flex;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 2px 4px;
      gap: 4px;
    }
    .btn-step {
      width: 28px !important;
      height: 28px !important;
      line-height: 28px !important;
      padding: 0 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .btn-step mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .qty-input-box {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 4px;
    }
    .stepper-input {
      width: 52px;
      height: 28px;
      text-align: center;
      font-weight: 700;
      font-size: 14px;
      color: #0f172a;
      border: 1px solid transparent;
      border-radius: 4px;
      background: #ffffff;
      outline: none;
      transition: all 0.2s ease;
    }
    .stepper-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }
    .input-error {
      border-color: #ef4444 !important;
      background: #fef2f2 !important;
      color: #dc2626 !important;
    }
    .qty-max-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      white-space: nowrap;
    }
    .row-error-msg {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #dc2626;
      font-size: 11px;
      font-weight: 600;
    }
    .row-error-msg mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .actions-cell {
      text-align: center;
      width: 50px;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .summary-card {
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      padding: 16px 20px;
      position: sticky;
      top: 24px;
    }
    .summary-content {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 16px 0 !important;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .summary-label {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .summary-val {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    .total-item {
      padding-top: 10px;
      border-top: 1px dashed #e2e8f0;
    }
    .summary-val-large {
      font-size: 20px;
      font-weight: 700;
      color: #2563eb;
    }
    .validation-warning {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12px;
      margin-top: 4px;
    }
    .validation-warning mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      flex-shrink: 0;
    }
    .validation-error {
      background: #fef2f2 !important;
      border-color: #fecaca !important;
      color: #991b1b !important;
    }
    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-top: 16px;
    }
    .save-btn {
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-weight: 600;
      border-radius: 8px;
    }
    .cancel-btn {
      height: 44px;
      border-radius: 8px;
    }
    .spinner {
      margin-right: 4px;
    }
  `]
})
export class NotaFiscalFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly produtoService = inject(ProdutoService);
  private readonly notaFiscalService = inject(NotaFiscalService);
  private readonly notification = inject(NotificationService);

  readonly salvando = signal<boolean>(false);
  readonly notaId = signal<number | null>(null);
  readonly isEdicao = computed(() => this.notaId() !== null);
  readonly produtosDisponiveis = this.produtoService.produtos;

  readonly produtoSelecionadoSignal = signal<Produto | null>(null);
  readonly itemFormQuantidadeSignal = signal<number>(1);
  readonly itensVersao = signal<number>(0);
  readonly originalItensMap = signal<Map<string, number>>(new Map());

  readonly form: FormGroup = this.fb.group({
    ativo: [true, Validators.required],
    itens: this.fb.array([])
  });

  readonly itemForm: FormGroup = this.fb.group({
    produtoSelecionado: [null, Validators.required],
    quantidade: [1, [Validators.required, Validators.min(1)]]
  });

  get itensArray(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  readonly totalUnidades = computed(() => {
    this.itensVersao();
    const controls = this.itensArray.controls;
    return controls.reduce((acc, ctrl) => acc + (Number(ctrl.get('quantidade')?.value) || 0), 0);
  });

  readonly saldoDisponivelSelecionado = computed(() => {
    this.itensVersao();
    const prod = this.produtoSelecionadoSignal();
    if (!prod) return 0;
    return this.obterSaldoDisponivelParaInclusao(prod);
  });

  readonly estoqueSuficienteAviso = computed(() => {
    this.itensVersao();
    const prod = this.produtoSelecionadoSignal();
    const qty = this.itemFormQuantidadeSignal();
    if (!prod) return false;
    const disp = this.saldoDisponivelSelecionado();
    return qty > disp;
  });

  readonly hasItensComEstoqueExcedido = computed(() => {
    this.itensVersao();
    return this.itensArray.controls.some(ctrl => ctrl.get('quantidade')?.hasError('max'));
  });

  constructor() {
    this.itemForm.get('produtoSelecionado')?.valueChanges.subscribe(prod => {
      this.produtoSelecionadoSignal.set(prod);
      this.atualizarValidadoresItemForm();
    });

    this.itemForm.get('quantidade')?.valueChanges.subscribe(val => {
      this.itemFormQuantidadeSignal.set(Number(val) || 0);
      this.onQuantidadeInput();
    });

    this.form.valueChanges.subscribe(() => {
      this.itensVersao.update(v => v + 1);
    });
  }

  ngOnInit(): void {
    // Load products from Estoque API to populate select
    this.produtoService.listar().subscribe({
      next: () => {
        this.itensVersao.update(v => v + 1);
        this.atualizarTodosValidadoresItens();
        this.atualizarValidadoresItemForm();
      }
    });

    // Check if editing existing NF
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const idNum = parseInt(idParam, 10);
      if (!isNaN(idNum)) {
        this.notaId.set(idNum);
        this.carregarNotaParaEdicao(idNum);
      }
    }
  }

  obterLimiteTotalDoProduto(codigo: string | undefined): number {
    if (!codigo) return 0;
    const p = this.produtosDisponiveis().find(item => item.codigo === codigo || item.id === codigo);
    const baseStock = p ? (p.saldo ?? p.saldoInicial ?? 0) : 0;
    const originalQtd = this.originalItensMap().get(codigo) ?? 0;
    return baseStock + originalQtd;
  }

  obterQuantidadeAlocadaNaNota(codigo: string | undefined, excetoIndex: number = -1): number {
    if (!codigo) return 0;
    let total = 0;
    this.itensArray.controls.forEach((ctrl, idx) => {
      if (idx !== excetoIndex && ctrl.get('codigo')?.value === codigo) {
        total += Number(ctrl.get('quantidade')?.value) || 0;
      }
    });
    return total;
  }

  obterSaldoDisponivelParaInclusao(produto: Produto | null): number {
    if (!produto || !produto.codigo) return 0;
    const limiteTotal = this.obterLimiteTotalDoProduto(produto.codigo);
    const alocado = this.obterQuantidadeAlocadaNaNota(produto.codigo);
    return Math.max(0, limiteTotal - alocado);
  }

  obterSaldoMaximoDoItem(index: number): number {
    this.itensVersao();
    const ctrl = this.itensArray.at(index);
    if (!ctrl) return 0;
    const codigo = ctrl.get('codigo')?.value;
    const limiteTotal = this.obterLimiteTotalDoProduto(codigo);
    const alocadoOutros = this.obterQuantidadeAlocadaNaNota(codigo, index);
    return Math.max(1, limiteTotal - alocadoOutros);
  }

  atualizarValidadoresItemForm(): void {
    const prod = this.produtoSelecionadoSignal();
    const qtdCtrl = this.itemForm.get('quantidade');
    if (!qtdCtrl) return;

    if (!prod) {
      qtdCtrl.setValidators([Validators.required, Validators.min(1)]);
      qtdCtrl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    const disp = this.obterSaldoDisponivelParaInclusao(prod);
    if (disp <= 0) {
      qtdCtrl.setValidators([Validators.required, Validators.min(1), Validators.max(0)]);
      qtdCtrl.setValue(0, { emitEvent: false });
      this.itemFormQuantidadeSignal.set(0);
    } else {
      qtdCtrl.setValidators([Validators.required, Validators.min(1), Validators.max(disp)]);
      const currentVal = Number(qtdCtrl.value);
      if (!currentVal || currentVal < 1) {
        qtdCtrl.setValue(1, { emitEvent: false });
        this.itemFormQuantidadeSignal.set(1);
      } else if (currentVal > disp) {
        qtdCtrl.setValue(disp, { emitEvent: false });
        this.itemFormQuantidadeSignal.set(disp);
      }
    }
    qtdCtrl.updateValueAndValidity({ emitEvent: false });
  }

  onProdutoSelecionadoChange(produto: Produto | null): void {
    this.produtoSelecionadoSignal.set(produto);
    this.atualizarValidadoresItemForm();
  }

  onQuantidadeInput(): void {
    const prod = this.produtoSelecionadoSignal();
    if (prod) {
      const disp = this.obterSaldoDisponivelParaInclusao(prod);
      const qtdCtrl = this.itemForm.get('quantidade');
      if (qtdCtrl) {
        if (disp <= 0) {
          qtdCtrl.setValidators([Validators.required, Validators.min(1), Validators.max(0)]);
        } else {
          qtdCtrl.setValidators([Validators.required, Validators.min(1), Validators.max(disp)]);
        }
        qtdCtrl.updateValueAndValidity({ emitEvent: false });
      }
    }
  }

  alterarQuantidadeItem(index: number, delta: number): void {
    const ctrl = this.itensArray.at(index);
    if (!ctrl) return;

    const atual = Number(ctrl.get('quantidade')?.value) || 1;
    const maximo = this.obterSaldoMaximoDoItem(index);
    const novo = Math.max(1, Math.min(maximo, atual + delta));

    ctrl.patchValue({ quantidade: novo });
    this.atualizarValidadoresItem(index);
    this.itensVersao.update(v => v + 1);
    this.atualizarValidadoresItemForm();
  }

  onItemQuantidadeChange(index: number): void {
    this.atualizarValidadoresItem(index);
    this.itensVersao.update(v => v + 1);
    this.atualizarValidadoresItemForm();
  }

  atualizarValidadoresItem(index: number): void {
    const ctrl = this.itensArray.at(index);
    if (!ctrl) return;
    const maximo = this.obterSaldoMaximoDoItem(index);
    const qtdCtrl = ctrl.get('quantidade');
    if (qtdCtrl) {
      qtdCtrl.setValidators([Validators.required, Validators.min(1), Validators.max(maximo)]);
      qtdCtrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  atualizarTodosValidadoresItens(): void {
    this.itensArray.controls.forEach((_, idx) => {
      this.atualizarValidadoresItem(idx);
    });
  }

  carregarNotaParaEdicao(id: number): void {
    this.notaFiscalService.obterPorId(id).subscribe({
      next: (nf) => {
        this.form.patchValue({ ativo: nf.ativo });
        this.itensArray.clear();

        const map = new Map<string, number>();
        (nf.itemNotaFiscal || []).forEach(item => {
          const cur = map.get(item.codigo) ?? 0;
          map.set(item.codigo, cur + (item.quantidade || 0));

          this.itensArray.push(this.fb.group({
            id: [item.id],
            produtoId: [item.produtoId || item.itemId || ''],
            itemId: [item.itemId || item.produtoId || ''],
            codigo: [item.codigo, Validators.required],
            descricao: [item.descricao, Validators.required],
            quantidade: [item.quantidade, [Validators.required, Validators.min(1)]]
          }));
        });

        this.originalItensMap.set(map);
        this.itensVersao.update(v => v + 1);
        this.atualizarTodosValidadoresItens();
        this.atualizarValidadoresItemForm();
      },
      error: (err) => {
        this.notification.erro(err.message || 'Erro ao carregar nota fiscal para edição.');
        this.router.navigate(['/notas-fiscais']);
      }
    });
  }

  adicionarItem(): void {
    const produto: Produto = this.itemForm.get('produtoSelecionado')?.value;
    if (!produto) {
      this.notification.erro('Selecione um produto cadastrado.');
      return;
    }

    const quantidade = Number(this.itemForm.get('quantidade')?.value) || 0;
    const disp = this.obterSaldoDisponivelParaInclusao(produto);

    if (quantidade <= 0) {
      this.notification.erro('A quantidade deve ser de no mínimo 1 unidade.');
      return;
    }

    if (quantidade > disp) {
      this.notification.erro(`Saldo insuficiente para "${produto.descricao}". Saldo disponível: ${disp} un.`);
      return;
    }

    if (this.itemForm.invalid) return;

    // Check if product already exists in items array
    const existenteIndex = this.itensArray.controls.findIndex(
      ctrl => ctrl.get('codigo')?.value === produto.codigo
    );

    if (existenteIndex >= 0) {
      const atual = Number(this.itensArray.at(existenteIndex).get('quantidade')?.value) || 0;
      const novoTotal = atual + quantidade;
      const limiteTotal = this.obterLimiteTotalDoProduto(produto.codigo);

      if (novoTotal > limiteTotal) {
        this.notification.erro(`A soma da quantidade (${novoTotal}) excede o saldo limite em estoque (${limiteTotal} un).`);
        return;
      }

      this.itensArray.at(existenteIndex).patchValue({
        quantidade: novoTotal
      });
      this.atualizarValidadoresItem(existenteIndex);
      this.notification.info(`Quantidade de "${produto.descricao}" atualizada para ${novoTotal} un.`);
    } else {
      const limiteTotal = this.obterLimiteTotalDoProduto(produto.codigo);
      this.itensArray.push(this.fb.group({
        id: [null],
        produtoId: [produto.id || '00000000-0000-0000-0000-000000000000'],
        itemId: [produto.id || '00000000-0000-0000-0000-000000000000'],
        codigo: [produto.codigo, Validators.required],
        descricao: [produto.descricao, Validators.required],
        quantidade: [quantidade, [Validators.required, Validators.min(1), Validators.max(limiteTotal)]]
      }));
      this.notification.sucesso(`"${produto.descricao}" adicionado à nota fiscal.`);
    }

    // Reset item form
    this.itemForm.reset({ produtoSelecionado: null, quantidade: 1 });
    this.produtoSelecionadoSignal.set(null);
    this.itemFormQuantidadeSignal.set(1);
    this.itensVersao.update(v => v + 1);
    this.atualizarTodosValidadoresItens();
  }

  removerItem(index: number): void {
    const item = this.itensArray.at(index);
    const desc = item.get('descricao')?.value;
    this.itensArray.removeAt(index);
    this.itensVersao.update(v => v + 1);
    this.atualizarTodosValidadoresItens();
    this.atualizarValidadoresItemForm();
    this.notification.info(`"${desc}" removido da nota fiscal.`);
  }

  salvarNotaFiscal(): void {
    if (this.form.invalid || this.itensArray.length === 0 || this.salvando()) return;

    this.salvando.set(true);
    const formVal = this.form.value;

    if (this.isEdicao() && this.notaId()) {
      const id = this.notaId()!;
      this.notaFiscalService.atualizar(id, {
        id: id,
        ativo: formVal.ativo,
        itemNotaFiscal: formVal.itens.map((i: any) => ({
          id: i.id,
          itemId: i.itemId || i.produtoId || '',
          codigo: i.codigo,
          descricao: i.descricao,
          quantidade: Number(i.quantidade)
        }))
      }).subscribe({
        next: () => {
          this.notification.sucesso(`Nota Fiscal #${id} atualizada com sucesso!`);
          this.router.navigate(['/notas-fiscais']);
        },
        error: (err) => {
          this.salvando.set(false);
          this.notification.erro(err.message || 'Erro ao atualizar nota fiscal.');
        }
      });
    } else {
      this.notaFiscalService.criar({
        ativo: formVal.ativo,
        itemNotaFiscal: formVal.itens.map((i: any) => ({
          produtoId: i.produtoId || i.itemId || '',
          codigo: i.codigo,
          descricao: i.descricao,
          quantidade: Number(i.quantidade)
        }))
      }).subscribe({
        next: (res) => {
          this.notification.sucesso(`Nota Fiscal #${res?.id || ''} criada com sucesso! Estoque atualizado.`);
          this.router.navigate(['/notas-fiscais']);
        },
        error: (err) => {
          this.salvando.set(false);
          this.notification.erro(err.message || 'Erro ao criar nota fiscal.');
        }
      });
    }
  }
}
