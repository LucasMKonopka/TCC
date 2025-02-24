import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout().subscribe(() => {
      console.log('Usuário deslogado com sucesso');
      this.router.navigate(['/Login']);
    }, error => {
      console.error('Erro ao deslogar:', error);
    });
  }
}
