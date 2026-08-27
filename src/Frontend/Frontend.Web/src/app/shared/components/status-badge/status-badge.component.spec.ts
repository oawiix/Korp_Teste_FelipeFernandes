import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Aberta" when ativo is true', () => {
    fixture.componentRef.setInput('tipo', 'nota-fiscal');
    fixture.componentRef.setInput('ativo', true);
    fixture.detectChanges();

    expect(component.badgeLabel()).toBe('Aberta');
    expect(component.badgeClass()).toBe('badge-success');
  });

  it('should display "Fechada" when ativo is false', () => {
    fixture.componentRef.setInput('tipo', 'nota-fiscal');
    fixture.componentRef.setInput('ativo', false);
    fixture.detectChanges();

    expect(component.badgeLabel()).toBe('Fechada');
    expect(component.badgeClass()).toBe('badge-closed');
  });

  it('should display estoque badges correctly', () => {
    fixture.componentRef.setInput('tipo', 'estoque');
    fixture.componentRef.setInput('saldo', 10);
    fixture.detectChanges();

    expect(component.badgeLabel()).toBe('Disponível (10)');
    expect(component.badgeClass()).toBe('badge-success');

    fixture.componentRef.setInput('saldo', 3);
    fixture.detectChanges();
    expect(component.badgeLabel()).toBe('Baixo Estoque (3)');
    expect(component.badgeClass()).toBe('badge-warning');

    fixture.componentRef.setInput('saldo', 0);
    fixture.detectChanges();
    expect(component.badgeLabel()).toBe('Sem Estoque');
    expect(component.badgeClass()).toBe('badge-danger');
  });
});
