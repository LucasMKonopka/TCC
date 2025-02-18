import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) { }

  email: string = '';
  password: string = '';

  login(){
    this.authService.login(this.email, this.password).subscribe(
      () => {
        this.router.navigate(['/home']);
      },
      (error) => {
        console.error('Erro no login:', error);
        alert('Erro no login: ' + error.message);
      }
    );
  }
}
