import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) { }

  email: string = '';
  password: string = '';

  login(){
    this.authService.login(this.email, this.password).subscribe(
      () => {
        this.toastr.success('Login realizado com sucesso!', 'Sucesso'); 
        this.router.navigate(['/home']);
      },
      (error) => {
        console.error('Erro no login:', error);
        let errorMessage = 'Ocorreu um erro ao tentar fazer login.';

        if (error.code === 'auth/invalid-credential') {
          errorMessage = 'Credenciais inválidas. Verifique seu e-mail e senha.';
        }

      this.toastr.error(errorMessage, 'Erro');
    }
    );
  }
}
