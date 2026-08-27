import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Visão Geral - Korp ERP'
      },
      {
        path: 'produtos',
        loadComponent: () =>
          import('./features/produtos/produto-list/produto-list.component').then(
            m => m.ProdutoListComponent
          ),
        title: 'Controle de Estoque - Korp ERP'
      },
      {
        path: 'notas-fiscais',
        loadComponent: () =>
          import('./features/notas-fiscais/nota-fiscal-list/nota-fiscal-list.component').then(
            m => m.NotaFiscalListComponent
          ),
        title: 'Notas Fiscais - Korp ERP'
      },
      {
        path: 'notas-fiscais/nova',
        loadComponent: () =>
          import('./features/notas-fiscais/nota-fiscal-form/nota-fiscal-form.component').then(
            m => m.NotaFiscalFormComponent
          ),
        title: 'Nova Nota Fiscal - Korp ERP'
      },
      {
        path: 'notas-fiscais/editar/:id',
        loadComponent: () =>
          import('./features/notas-fiscais/nota-fiscal-form/nota-fiscal-form.component').then(
            m => m.NotaFiscalFormComponent
          ),
        title: 'Editar Nota Fiscal - Korp ERP'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
