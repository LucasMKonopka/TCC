import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  
  nome: string;
  cpf: string;
  email: string;
  password: string;
  repetepassword: string;

  constructor(private authService: AuthService, private router: Router) {}

  signUp(){
    if (this.password !== this.repetepassword) {
      console.error('As senhas não coincidem.');
      return;
    }

    this.authService.signUp(this.nome, this.cpf, this.email, this.password).subscribe(
      () => {
        this.router.navigate(['/home']);
      },
      (error) => {
        console.error('Erro ao cadastrar:', error);
        // Adicione lógica para lidar com erros
      }
    );
  }

}
