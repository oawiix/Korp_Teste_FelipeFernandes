import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { ProdutoService } from '../core/services/produto.service';
import { NotaFiscalService } from '../core/services/nota-fiscal.service';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  template: `
    <div class="app-layout">
      <!-- Toolbar -->
      <mat-toolbar class="main-toolbar">
        <div class="toolbar-left">
          <button mat-icon-button (click)="sidenav.toggle()" class="menu-toggle-btn">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="brand-logo" routerLink="/dashboard">
            <div class="brand-icon">
              <mat-icon>hub</mat-icon>
            </div>
            <div class="brand-text">
              <span class="brand-name">KORP ERP</span>
              <span class="brand-tag">Estoque & Faturamento</span>
            </div>
          </div>
        </div>

      </mat-toolbar>

      <!-- Sidenav Container -->
      <mat-sidenav-container class="sidenav-container">
        <!-- Sidebar Navigation -->
        <mat-sidenav #sidenav mode="side" opened class="sidebar">
          <div class="nav-section-title">NAVEGAÇÃO PRINCIPAL</div>
          <mat-nav-list class="nav-list">
            <!-- Dashboard -->
            <a
              mat-list-item
              routerLink="/dashboard"
              routerLinkActive="active-nav-item"
              class="nav-item"
            >
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle class="nav-title">Visão Geral</span>
            </a>

            <!-- Produtos / Estoque -->
            <a
              mat-list-item
              routerLink="/produtos"
              routerLinkActive="active-nav-item"
              class="nav-item"
            >
              <mat-icon matListItemIcon>inventory_2</mat-icon>
              <span matListItemTitle class="nav-title">Produtos & Estoque</span>
              @if (produtoService.totalProdutos() > 0) {
                <span matListItemMeta class="counter-badge badge-blue">
                  {{ produtoService.totalProdutos() }}
                </span>
              }
            </a>

            <!-- Notas Fiscais / Faturamento -->
            <a
              mat-list-item
              routerLink="/notas-fiscais"
              routerLinkActive="active-nav-item"
              class="nav-item"
            >
              <mat-icon matListItemIcon>receipt_long</mat-icon>
              <span matListItemTitle class="nav-title">Notas Fiscais</span>
              @if (notaFiscalService.totalAbertas() > 0) {
                <span matListItemMeta class="counter-badge badge-green">
                  {{ notaFiscalService.totalAbertas() }}
                </span>
              }
            </a>
          </mat-nav-list>

          <div class="sidebar-spacer"></div>

          <!-- Tech info footer -->
          <div class="sidebar-footer">
            <div class="tech-badge">
              <span class="tech-title">Arquitetura Integrada</span>
              <span class="tech-desc">RabbitMQ • PostgreSQL • .NET 10</span>
            </div>
          </div>
        </mat-sidenav>

        <!-- Main Content Area -->
        <mat-sidenav-content class="main-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: #f8fafc;
    }
    .main-toolbar {
      background: #ffffff;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      height: 64px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      z-index: 100;
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      text-decoration: none;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }
    .brand-icon mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding-top: 8px;
      color: #0f172a;
      line-height: 1.1;
    }
    .brand-tag {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }
    .system-status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f1f5f9;
      padding: 6px 12px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
    }
    .status-label {
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }
    .sidenav-container {
      flex: 1;
      background: #f8fafc;
    }
    .sidebar {
      width: 260px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      padding: 16px 0;
    }
    .nav-section-title {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.8px;
      padding: 0 20px 8px 20px;
    }
    .nav-list {
      padding: 0 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-item {
      border-radius: 8px;
      transition: all 0.2s ease;
      color: #475569;
      height: 48px;
    }
    .nav-item:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .active-nav-item {
      background: rgba(37, 99, 235, 0.08) !important;
      color: #2563eb !important;
      font-weight: 600;
    }
    .active-nav-item mat-icon {
      color: #2563eb !important;
    }
    .nav-title {
      font-size: 14px;
      font-weight: inherit;
    }
    .counter-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
      margin-left: auto;
    }
    .badge-blue {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .badge-green {
      background: #dcfce7;
      color: #15803d;
    }
    .sidebar-spacer {
      flex: 1;
    }
    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid #f1f5f9;
    }
    .tech-badge {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .tech-title {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .tech-desc {
      font-size: 11px;
      color: #94a3b8;
    }
    .main-content {
      overflow-y: auto;
      height: 100%;
    }
  `]
})
export class LayoutComponent {
  readonly produtoService = inject(ProdutoService);
  readonly notaFiscalService = inject(NotaFiscalService);
}
