# 📘 Guia de Estudo: Desenvolvimento do Frontend ERP com Angular 19/22 e Material 3

Este guia foi elaborado para servir como um **material de estudo completo e detalhado**, explicando passo a passo todas as decisões arquiteturais, padrões de projeto, recursos do Angular moderno (Signals, Standalone Components, Reactive Forms com `FormArray`) e integração com microsserviços de **Estoque** e **Faturamento**.

---

## 📑 Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Estrutura de Pastas e Clean Architecture no Frontend](#2-estrutura-de-pastas-e-clean-architecture-no-frontend)
3. [Passo 1: Configuração do Ambiente, Environments e Proxy](#passo-1-configuração-do-ambiente-environments-e-proxy)
4. [Passo 2: Modelagem de Dados e Tipagem TypeScript (`models/`)](#passo-2-modelagem-de-dados-e-tipagem-typescript)
5. [Passo 3: Camada de Serviços Reativa com Signals e HttpClient (`services/`)](#passo-3-camada-de-serviços-reativa-com-signals-e-httpclient)
6. [Passo 4: Componentes Reutilizáveis (`shared/components/`)](#passo-4-componentes-reutilizáveis)
7. [Passo 5: Módulo de Produtos & Estoque (`features/produtos/`)](#passo-5-módulo-de-produtos--estoque)
8. [Passo 6: Módulo de Notas Fiscais & Formulário Dinâmico (`features/notas-fiscais/`)](#passo-6-módulo-de-notas-fiscais--formulário-dinâmico)
9. [Passo 7: Dashboard de Gestão Integrada (`features/dashboard/`)](#passo-7-dashboard-de-gestão-integrada)
10. [Passo 8: Layout, Navegação e Roteamento com Lazy Loading](#passo-8-layout-navegação-e-roteamento-com-lazy-loading)
11. [Passo 9: Testes Unitários de Serviços e Componentes](#passo-9-testes-unitários-de-serviços-e-componentes)
12. [Resumo dos Ciclos de Vida e Melhores Práticas](#12-resumo-dos-ciclos-de-vida-e-melhores-práticas)

---

## 1. Visão Geral da Arquitetura

O sistema implementa uma interface web moderna para operar com um backend de **Microsserviços distribuídos**:
- **Microsserviço de Estoque (`Estoque.Api`)**: Porta `5159` (ou `5001` via Docker). Responsável por cadastro de produtos, controle de saldos e baixa de estoque.
- **Microsserviço de Faturamento (`Faturamento.Api`)**: Porta `5226` (ou `5002` via Docker). Responsável por emissão de notas fiscais, numeração sequencial e publicação de eventos no **RabbitMQ** para atualização automática do estoque.

### Por que Angular Moderno (Standalone + Signals)?
1. **Zero NgModules**: Todas as declarações usam `imports: [...]` diretamente no `@Component`, eliminando código boilerplate.
2. **Angular Signals**: Substituem o excesso de `BehaviorSubject` do RxJS para estado de tela, proporcionando reatividade síncrona, rastreabilidade precisa e performance nativa.
3. **Angular Material 3**: Design system corporativo com tipografia consistente, contraste acessível e suporte a temas.

---

## 2. Estrutura de Pastas e Clean Architecture no Frontend

Adotamos a divisão modular recomendada pela comunidade Angular:

```
src/app/
├── core/                         # Singleton services, modelos globais e regras de negócio
│   ├── models/                   # Interfaces TypeScript (DTOs e entidades)
│   │   ├── api-response.model.ts
│   │   ├── produto.model.ts
│   │   └── nota-fiscal.model.ts
│   └── services/                 # Serviços de comunicação HTTP e estado com Signals
│       ├── notification.service.ts
│       ├── produto.service.ts
│       └── nota-fiscal.service.ts
├── shared/                       # Componentes, pipes e diretivas reutilizáveis
│   └── components/
│       ├── confirm-dialog/       # Modal genérico de confirmação
│       ├── empty-state/          # Feedback visual para listas vazias
│       └── status-badge/         # Badge de status (Aberta/Fechada, Estoque)
├── features/                     # Páginas e funcionalidades de negócio
│   ├── dashboard/                # Painel de KPIs e visão geral
│   ├── produtos/                 # Listagem e diálogo de cadastro/edição de produtos
│   │   ├── produto-list/
│   │   └── produto-form-dialog/
│   └── notas-fiscais/            # Listagem, emissão e detalhes de notas
│       ├── nota-fiscal-list/
│       ├── nota-fiscal-form/
│       └── nota-fiscal-detail-dialog/
├── layout/                       # Estrutura base visual (Toolbar + Sidenav)
├── app.config.ts                 # Provedores globais (Router, HttpClient, Animations)
├── app.routes.ts                 # Configuração de rotas com Lazy Loading
└── styles.scss                   # Tema global Material 3 e classes utilitárias
```

---

## Passo 1: Configuração do Ambiente, Environments e Proxy

### 1.1 Variáveis de Ambiente (`src/environments/`)
Criamos arquivos para gerenciar os endereços dos microsserviços em desenvolvimento e produção:

```typescript
// src/environments/environment.ts (Desenvolvimento)
export const environment = {
  production: false,
  estoqueApiUrl: 'http://localhost:5159',
  faturamentoApiUrl: 'http://localhost:5226'
};
```

```typescript
// src/environments/environment.prod.ts (Produção / Docker)
export const environment = {
  production: true,
  estoqueApiUrl: 'http://localhost:5001',
  faturamentoApiUrl: 'http://localhost:5002'
};
```

### 1.2 Configuração de Proxy (`proxy.conf.json`)
Para evitar bloqueios de **CORS** (_Cross-Origin Resource Sharing_) durante o desenvolvimento local:

```json
{
  "/api/estoque": {
    "target": "http://localhost:5159",
    "secure": false,
    "pathRewrite": { "^/api/estoque": "" },
    "changeOrigin": true
  },
  "/api/faturamento": {
    "target": "http://localhost:5226",
    "secure": false,
    "pathRewrite": { "^/api/faturamento": "" },
    "changeOrigin": true
  }
}
```

No `angular.json`, vinculamos o proxy ao comando `ng serve`:
```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

---

## Passo 2: Modelagem de Dados e Tipagem TypeScript

A tipagem forte previne erros em tempo de compilação e reflete com precisão os contratos do backend.

### 2.1 Resposta Padrão da API (`api-response.model.ts`)
O backend utiliza o padrão `ResponseModel<T>`. Mapeamos isso no TypeScript:

```typescript
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timeStamp: string;
}
```

### 2.2 Modelos de Produto (`produto.model.ts`)
Conforme o escopo:
- **Código**: string identificadora
- **Descrição**: nome do produto
- **Saldo**: quantidade disponível

```typescript
export interface Produto {
  id?: string;
  codigo: string;
  descricao: string;
  saldoInicial?: number;
  saldo?: number;
}

export interface CriarProdutoRequest {
  codigo: string;
  descricao: string;
  saldoInicial: number;
}

export interface AtualizarProdutoRequest {
  codigo: string;
  descricao: string;
  novoSaldo: number;
}
```

### 2.3 Modelos de Nota Fiscal (`nota-fiscal.model.ts`)
Conforme o escopo:
- **Numeração sequencial**: gerada automaticamente pelo backend (`id`)
- **Status**: `ativo` (true = Aberta, false = Fechada)
- **Múltiplos produtos**: array de itens com `quantidade`

```typescript
export interface ItemNotaFiscal {
  id?: number;
  itemId?: string;
  produtoId?: string;
  codigo: string;
  descricao: string;
  quantidade: number;
}

export interface NotaFiscal {
  id: number;
  ativo: boolean;
  itemNotaFiscal: ItemNotaFiscal[];
}

export interface CriarItemNotaFiscalRequest {
  produtoId: string;
  codigo: string;
  descricao: string;
  quantidade: number;
}

export interface CriarNotaFiscalRequest {
  ativo: boolean;
  itemNotaFiscal: CriarItemNotaFiscalRequest[];
}
```

---

## Passo 3: Camada de Serviços Reativa com Signals e HttpClient

Combinamos o `HttpClient` do Angular com **Angular Signals** para manter o estado centralizado e síncrono para os componentes.

### 3.1 `ProdutoService` (`core/services/produto.service.ts`)
- `produtos = signal<Produto[]>([])`: Armazena a lista de produtos.
- `carregando = signal<boolean>(false)`: Controle de spinners de carregamento.
- `computed()`: Valores calculados automaticamente quando `produtos()` muda (ex: `totalEstoque`, `produtosEstoqueBaixo`).

```typescript
@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.estoqueApiUrl;

  readonly produtos = signal<Produto[]>([]);
  readonly carregando = signal<boolean>(false);

  // Computeds automáticos
  readonly totalProdutos = computed(() => this.produtos().length);
  readonly totalEstoque = computed(() =>
    this.produtos().reduce((sum, p) => sum + (p.saldo ?? p.saldoInicial ?? 0), 0)
  );
  readonly produtosEstoqueBaixo = computed(() =>
    this.produtos().filter(p => (p.saldo ?? p.saldoInicial ?? 0) <= 5 && (p.saldo ?? p.saldoInicial ?? 0) > 0)
  );

  listar(): Observable<Produto[]> {
    this.carregando.set(true);
    return this.http.get<ApiResponse<Produto[]>>(`${this.baseUrl}/Listar`).pipe(
      map(res => (res.data ?? []).map(p => ({ ...p, saldo: p.saldo ?? p.saldoInicial ?? 0 }))),
      tap(produtos => {
        this.produtos.set(produtos);
        this.carregando.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.carregando.set(false);
        // Trata retorno 400 gracioso quando o banco está vazio
        if (error.status === 400 && error.error?.message?.toLowerCase().includes('nenhum produto')) {
          this.produtos.set([]);
          return of([]);
        }
        return throwError(() => new Error(error.error?.message || 'Erro ao listar'));
      })
    );
  }
}
```

### 3.2 `NotaFiscalService` (`core/services/nota-fiscal.service.ts`)
Gerencia o estado das notas fiscais e oferece métodos para criação, alternância de status (*Aberta/Fechada*) e exclusão.

### 3.3 `NotificationService` (`core/services/notification.service.ts`)
Encapsula o `MatSnackBar` para exibir mensagens com cores temáticas (sucesso = verde, erro = vermelho, aviso = âmbar).

---

## Passo 4: Componentes Reutilizáveis

### 4.1 `StatusBadgeComponent`
Exibe de forma padronizada os status:
- Para Nota Fiscal: **Aberta** (verde) ou **Fechada** (cinza).
- Para Estoque: **Disponível**, **Baixo Estoque** (alerta) ou **Sem Estoque** (crítico).

Utiliza `computed()` para resolver classes CSS e ícones de acordo com os inputs:
```typescript
readonly badgeClass = computed(() => {
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
```

### 4.2 `ConfirmDialogComponent`
Um diálogo genérico aberto via `MatDialog` para pedir confirmação do usuário antes de operações destrutivas (como excluir um produto ou nota fiscal).

### 4.3 `EmptyStateComponent`
Exibido quando uma listagem não possui registros, apresentando um ícone temático, mensagem explicativa e um botão de ação rápida (Call To Action).

---

## Passo 5: Módulo de Produtos & Estoque

### 5.1 Listagem de Produtos (`ProdutoListComponent`)
- **Tabela Angular Material (`MatTable`)**: colunas `codigo`, `descricao`, `saldo`, `status` e `acoes`.
- **Filtros reativos com `computed()`**:
  - Busca por texto (filtra por código ou descrição em tempo real).
  - Filtro por situação (*Todos*, *Estoque Baixo*, *Sem Estoque*).
- **Cards de Métricas**: Indicam volume total em estoque e alertas.

### 5.2 Formulário de Produto (`ProdutoFormDialogComponent`)
Usa `ReactiveFormsModule` e `FormBuilder`:
- Validações:
  - `codigo`: obrigatório (`Validators.required`).
  - `descricao`: obrigatória (`Validators.required`).
  - `saldo`: obrigatório e não negativo (`Validators.min(0)`).
- Suporta **Criação** ou **Edição** reaproveitando a mesma tela.

---

## Passo 6: Módulo de Notas Fiscais & Formulário Dinâmico

Este é um dos pontos mais importantes do escopo: **permitir a inclusão de múltiplos produtos com respectivas quantidades**.

### 6.1 O Formulário Dinâmico com `FormArray` (`NotaFiscalFormComponent`)
Um `FormArray` do Angular permite adicionar e remover linhas dinamicamente no formulário.

#### Estrutura do Formulário:
```typescript
readonly form: FormGroup = this.fb.group({
  ativo: [true, Validators.required], // Status: Aberta ou Fechada
  itens: this.fb.array([])            // Múltiplos produtos
});
```

#### Seleção e Adição de Produtos:
1. O formulário carrega os produtos cadastrados do `ProdutoService`.
2. O usuário seleciona um produto no dropdown e informa a quantidade.
3. Se o produto já estiver na nota, a quantidade é somada; caso contrário, uma nova linha é criada no `FormArray`:

```typescript
adicionarItem(): void {
  const produto = this.itemForm.get('produtoSelecionado')?.value;
  const quantidade = Number(this.itemForm.get('quantidade')?.value);

  const existenteIndex = this.itensArray.controls.findIndex(
    ctrl => ctrl.get('codigo')?.value === produto.codigo
  );

  if (existenteIndex >= 0) {
    const atual = Number(this.itensArray.at(existenteIndex).get('quantidade')?.value);
    this.itensArray.at(existenteIndex).patchValue({ quantidade: atual + quantidade });
  } else {
    this.itensArray.push(this.fb.group({
      produtoId: [produto.id],
      codigo: [produto.codigo, Validators.required],
      descricao: [produto.descricao, Validators.required],
      quantidade: [quantidade, [Validators.required, Validators.min(1)]]
    }));
  }
}
```

#### Validação de Saldo em Tempo Real:
Um `computed()` verifica se a quantidade solicitada ultrapassa o saldo disponível do produto no estoque, emitindo um aviso visual antes do envio.

---

## Passo 7: Dashboard de Gestão Integrada

O [`DashboardComponent`](file:///Users/oawiix/RiderProjects/KorpTeste/Korp/KorpApp/src/Frontend/Frontend.Web/src/app/features/dashboard/dashboard.component.ts) consolida as informações de ambos os microsserviços:
- **KPIs**: Produtos cadastrados, Notas Abertas/Fechadas, Volume total faturado e alertas de ruptura de estoque.
- **Ações Rápidas**: Botões diretos para cadastrar produto ou emitir nota.
- **Tabelas Resumo**: As 5 movimentações mais recentes de produtos e notas fiscais.

---

## Passo 8: Layout, Navegação e Roteamento com Lazy Loading

### 8.1 Rotas Standalone (`app.routes.ts`)
Utilizamos a função `loadComponent()` para carregar os componentes sob demanda (*Lazy Loading*), gerando chunks JavaScript reduzidos:

```typescript
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'produtos',
        loadComponent: () => import('./features/produtos/produto-list/produto-list.component').then(m => m.ProdutoListComponent)
      },
      {
        path: 'notas-fiscais',
        loadComponent: () => import('./features/notas-fiscais/nota-fiscal-list/nota-fiscal-list.component').then(m => m.NotaFiscalListComponent)
      },
      {
        path: 'notas-fiscais/nova',
        loadComponent: () => import('./features/notas-fiscais/nota-fiscal-form/nota-fiscal-form.component').then(m => m.NotaFiscalFormComponent)
      }
    ]
  }
];
```

### 8.2 Provedores Globais (`app.config.ts`)
Configuração moderna sem `AppModule`:
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withFetch()),
    provideAnimationsAsync()
  ]
};
```

---

## Passo 9: Testes Unitários de Serviços e Componentes

Utilizamos o test runner nativo com **Vitest**:

### Exemplo de Teste de Serviço (`produto.service.spec.ts`):
```typescript
it('should list products and update signals', () => {
  const mock = [{ id: '1', codigo: 'P1', descricao: 'Prod 1', saldo: 10 }];

  service.listar().subscribe(res => {
    expect(res.length).toBe(1);
  });

  const req = httpMock.expectOne(`${environment.estoqueApiUrl}/Listar`);
  expect(req.request.method).toBe('GET');
  req.flush({ data: mock, success: true });

  expect(service.produtos().length).toBe(1);
  expect(service.totalEstoque()).toBe(10);
});
```

Execução dos testes:
```bash
npm test -- --watch=false
```

---

## 12. Resumo dos Ciclos de Vida e Melhores Práticas

Ao documentar a implementação técnica:

| Recurso / Ciclo | Como foi utilizado no projeto |
| :--- | :--- |
| **`ngOnInit`** | Disparo inicial das chamadas HTTP para alimentar os Signals (`listar()`). |
| **Signals (`signal()`)** | Armazenamento de estado reativo atômico (`produtos`, `notasFiscais`, `carregando`). |
| **Computed (`computed()`)** | Substituição de pipes e lógicas de template pesadas por cálculos síncronos cacheados. |
| **RxJS `pipe()` / `map()` / `tap()`** | Manipulação do fluxo de resposta HTTP antes de persistir nos Signals. |
| **Reactive Forms (`FormArray`)** | Gerenciamento de linhas dinâmicas de múltiplos produtos nas Notas Fiscais. |
| **Angular Material 3** | Interface padronizada, acessível e responsiva. |

---

> 💡 **Dica de Estudo**: Para praticar, clone a estrutura e tente adicionar novos recursos, como exportação de relatório em PDF, busca avançada por intervalo de datas ou filtros adicionais por volume de estoque!
