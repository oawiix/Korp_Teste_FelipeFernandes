import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-status-badge',
  imports: [MatIconModule],
  template: `
    <span class="badge" [class]="badgeClass()">
      <mat-icon class="badge-icon">{{ badgeIcon() }}</mat-icon>
      <span class="badge-text">{{ badgeLabel() }}</span>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.2px;
      line-height: 1;
      white-space: nowrap;
      transition: all 0.2s ease;
    }
    .badge-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .badge-success {
      background-color: rgba(46, 125, 50, 0.12);
      color: #2e7d32;
      border: 1px solid rgba(46, 125, 50, 0.25);
    }
    .badge-closed {
      background-color: rgba(97, 97, 97, 0.12);
      color: #616161;
      border: 1px solid rgba(97, 97, 97, 0.25);
    }
    .badge-warning {
      background-color: rgba(237, 108, 2, 0.12);
      color: #ed6c02;
      border: 1px solid rgba(237, 108, 2, 0.25);
    }
    .badge-danger {
      background-color: rgba(211, 47, 47, 0.12);
      color: #d32f2f;
      border: 1px solid rgba(211, 47, 47, 0.25);
    }
    .badge-info {
      background-color: rgba(2, 136, 209, 0.12);
      color: #0288d1;
      border: 1px solid rgba(2, 136, 209, 0.25);
    }
  `]
})
export class StatusBadgeComponent {
  // Status type: 'nota-fiscal' or 'estoque' or 'custom'
  readonly tipo = input<'nota-fiscal' | 'estoque' | 'custom'>('nota-fiscal');
  readonly ativo = input<boolean | undefined>(undefined);
  readonly saldo = input<number | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly variante = input<'success' | 'warning' | 'danger' | 'info' | 'closed'>('info');
  readonly icone = input<string | undefined>(undefined);

  readonly badgeLabel = computed(() => {
    if (this.label()) return this.label()!;

    if (this.tipo() === 'nota-fiscal') {
      return this.ativo() ? 'Aberta' : 'Fechada';
    }

    if (this.tipo() === 'estoque') {
      const q = this.saldo() ?? 0;
      if (q <= 0) return 'Sem Estoque';
      if (q <= 5) return `Baixo Estoque (${q})`;
      return `Disponível (${q})`;
    }

    return '';
  });

  readonly badgeClass = computed(() => {
    if (this.tipo() === 'custom') {
      return `badge-${this.variante()}`;
    }

    if (this.tipo() === 'nota-fiscal') {
      return this.ativo() ? 'badge-success' : 'badge-closed';
    }

    if (this.tipo() === 'estoque') {
      const q = this.saldo() ?? 0;
      if (q <= 0) return 'badge-danger';
      if (q <= 5) return 'badge-warning';
      return 'badge-success';
    }

    return 'badge-info';
  });

  readonly badgeIcon = computed(() => {
    if (this.icone()) return this.icone()!;

    if (this.tipo() === 'nota-fiscal') {
      return this.ativo() ? 'check_circle' : 'lock';
    }

    if (this.tipo() === 'estoque') {
      const q = this.saldo() ?? 0;
      if (q <= 0) return 'error_outline';
      if (q <= 5) return 'warning_amber';
      return 'inventory_2';
    }

    return 'info';
  });
}
