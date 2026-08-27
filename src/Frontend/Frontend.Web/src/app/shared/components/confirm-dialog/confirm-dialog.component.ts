import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  corConfirmar?: 'primary' | 'accent' | 'warn';
  icone?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      @if (data.icone) {
        <mat-icon [color]="data.corConfirmar || 'warn'" class="dialog-icon">{{ data.icone }}</mat-icon>
      }
      <span>{{ data.titulo }}</span>
    </h2>
    <mat-dialog-content>
      <p class="dialog-message">{{ data.mensagem }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">
        {{ data.textoCancelar || 'Cancelar' }}
      </button>
      <button
        mat-flat-button
        [color]="data.corConfirmar || 'warn'"
        [mat-dialog-close]="true"
        cdkFocusInitial
      >
        {{ data.textoConfirmar || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      font-weight: 500;
    }
    .dialog-icon {
      font-size: 24px;
      height: 24px;
      width: 24px;
    }
    .dialog-message {
      color: var(--mat-sys-on-surface-variant, #555);
      line-height: 1.5;
      margin: 0;
      font-size: 15px;
    }
    mat-dialog-actions {
      padding-top: 16px;
      gap: 8px;
    }
  `]
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
}
