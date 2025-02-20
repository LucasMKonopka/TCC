import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';


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

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}

  signUp() {
    if (this.nome == null || this.cpf == null || this.email == null || this.password == null|| this.repetepassword == null) {
      this.toastr.error('Preencha todos os campos corretamente.', 'Erro de Cadastro');
      return;
    }

    if (this.password !== this.repetepassword) {
      this.toastr.error('As senhas não coincidem.', 'Erro de Cadastro');
      return;
    }

    this.authService.signUp(this.nome, this.cpf, this.email, this.password).subscribe(
      () => {
        this.toastr.success('Cadastro realizado com sucesso!', 'Sucesso');
        this.router.navigate(['/home']);
      },
      (error) => {
        console.error('Erro ao cadastrar:', error);
  
        if (error?.code === 'auth/email-already-in-use') {
          this.toastr.error('Este e-mail já está cadastrado.', 'Erro de Cadastro');
        } else {
          this.toastr.error('Erro ao cadastrar. Tente novamente.', 'Erro de Cadastro');
        }
      }
    );
  }
}
