import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state-container">
      <div class="empty-state-icon-wrapper">
        <mat-icon class="empty-state-icon">{{ icone() }}</mat-icon>
      </div>
      <h3 class="empty-state-titulo">{{ titulo() }}</h3>
      <p class="empty-state-descricao">{{ descricao() }}</p>
      @if (textoBotao()) {
        <button mat-flat-button color="primary" (click)="acao.emit()" class="empty-state-btn">
          @if (iconeBotao()) {
            <mat-icon>{{ iconeBotao() }}</mat-icon>
          }
          {{ textoBotao() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.02);
      border: 1px dashed rgba(0, 0, 0, 0.12);
      margin: 16px 0;
    }
    .empty-state-icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(25, 118, 210, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .empty-state-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #1976d2;
    }
    .empty-state-titulo {
      font-size: 18px;
      font-weight: 600;
      color: var(--mat-sys-on-surface, #212121);
      margin: 0 0 8px 0;
    }
    .empty-state-descricao {
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant, #666);
      max-width: 420px;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }
    .empty-state-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  `]
})
export class EmptyStateComponent {
  readonly icone = input<string>('inventory_2');
  readonly titulo = input<string>('Nenhum item encontrado');
  readonly descricao = input<string>('Nenhum registro foi cadastrado até o momento.');
  readonly textoBotao = input<string>('');
  readonly iconeBotao = input<string>('add');

  readonly acao = output<void>();
}
