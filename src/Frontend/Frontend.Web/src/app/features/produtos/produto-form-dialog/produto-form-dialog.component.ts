import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Produto } from '../../../core/models/produto.model';
import { ProdutoService } from '../../../core/services/produto.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface ProdutoFormDialogData {
  produto?: Produto;
}

@Component({
  selector: 'app-produto-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon color="primary">{{ isEdicao ? 'edit' : 'add_box' }}</mat-icon>
      <span>{{ isEdicao ? 'Editar Produto' : 'Cadastrar Novo Produto' }}</span>
    </h2>

    <form [formGroup]="form" (ngSubmit)="salvar()">
      <mat-dialog-content class="dialog-content">
        <div class="form-grid">
          <!-- Código -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Código do Produto</mat-label>
            <input
              matInput
              formControlName="codigo"
              placeholder="Ex: PROD-001"
              autocomplete="off"
            />
            <mat-icon matPrefix>qr_code</mat-icon>
            @if (form.get('codigo')?.hasError('required') && form.get('codigo')?.touched) {
              <mat-error>Código é obrigatório.</mat-error>
            }
          </mat-form-field>

          <!-- Descrição -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descrição / Nome</mat-label>
            <input
              matInput
              formControlName="descricao"
              placeholder="Ex: Teclado Mecânico RGB"
              autocomplete="off"
            />
            <mat-icon matPrefix>description</mat-icon>
            @if (form.get('descricao')?.hasError('required') && form.get('descricao')?.touched) {
              <mat-error>Descrição é obrigatória.</mat-error>
            }
          </mat-form-field>

          <!-- Saldo -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ isEdicao ? 'Novo Saldo em Estoque' : 'Saldo Inicial em Estoque' }}</mat-label>
            <input
              matInput
              type="number"
              min="0"
              formControlName="saldo"
              placeholder="0"
            />
            <mat-icon matPrefix>inventory</mat-icon>
            @if (form.get('saldo')?.hasError('required') && form.get('saldo')?.touched) {
              <mat-error>Saldo é obrigatório.</mat-error>
            }
            @if (form.get('saldo')?.hasError('min') && form.get('saldo')?.touched) {
              <mat-error>Saldo não pode ser negativo.</mat-error>
            }
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]="false" [disabled]="salvando()">
          Cancelar
        </button>
        <button
          mat-flat-button
          color="primary"
          type="submit"
          [disabled]="form.invalid || salvando()"
          class="submit-btn"
        >
          @if (salvando()) {
            <mat-spinner diameter="18" class="spinner"></mat-spinner>
          } @else {
            <mat-icon>{{ isEdicao ? 'save' : 'check' }}</mat-icon>
          }
          <span>{{ isEdicao ? 'Salvar Alterações' : 'Cadastrar Produto' }}</span>
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      font-size: 20px;
    }
    .dialog-content {
      padding-top: 16px !important;
      min-width: 380px;
      max-width: 500px;
    }
    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .full-width {
      width: 100%;
    }
    mat-dialog-actions {
      padding: 16px 24px 20px 24px;
      gap: 10px;
    }
    .submit-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .spinner {
      margin-right: 4px;
    }
  `]
})
export class ProdutoFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProdutoFormDialogComponent>);
  private readonly produtoService = inject(ProdutoService);
  private readonly notification = inject(NotificationService);
  readonly data = inject<ProdutoFormDialogData>(MAT_DIALOG_DATA, { optional: true });

  readonly salvando = signal<boolean>(false);
  readonly isEdicao = !!this.data?.produto;

  readonly form: FormGroup = this.fb.group({
    codigo: [this.data?.produto?.codigo || '', [Validators.required, Validators.maxLength(50)]],
    descricao: [this.data?.produto?.descricao || '', [Validators.required, Validators.maxLength(150)]],
    saldo: [
      this.data?.produto ? (this.data.produto.saldo ?? this.data.produto.saldoInicial ?? 0) : 0,
      [Validators.required, Validators.min(0)]
    ]
  });

  salvar(): void {
    if (this.form.invalid || this.salvando()) return;

    this.salvando.set(true);
    const formVal = this.form.value;

    if (this.isEdicao && this.data?.produto?.id) {
      this.produtoService.atualizar(this.data.produto.id, {
        codigo: formVal.codigo,
        descricao: formVal.descricao,
        novoSaldo: Number(formVal.saldo)
      }).subscribe({
        next: () => {
          this.notification.sucesso('Produto atualizado com sucesso!');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.salvando.set(false);
          this.notification.erro(err.message || 'Erro ao atualizar produto.');
        }
      });
    } else {
      this.produtoService.criar({
        codigo: formVal.codigo,
        descricao: formVal.descricao,
        saldoInicial: Number(formVal.saldo)
      }).subscribe({
        next: () => {
          this.notification.sucesso('Produto cadastrado com sucesso!');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.salvando.set(false);
          this.notification.erro(err.message || 'Erro ao cadastrar produto.');
        }
      });
    }
  }
}
