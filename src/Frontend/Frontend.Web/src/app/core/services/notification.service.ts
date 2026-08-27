import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  sucesso(mensagem: string, duracaoMs = 4000): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: duracaoMs,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success']
    });
  }

  erro(mensagem: string, duracaoMs = 5000): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: duracaoMs,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }

  aviso(mensagem: string, duracaoMs = 4000): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: duracaoMs,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-warning']
    });
  }

  info(mensagem: string, duracaoMs = 3000): void {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: duracaoMs,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-info']
    });
  }
}
