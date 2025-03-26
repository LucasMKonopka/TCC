import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';


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
  showPasswordReset() {
    Swal.fire({
      title: 'Redefinir senha',
      html: `
        <p>Digite seu e-mail cadastrado para receber o link de redefinição:</p>
        <input type="email" id="reset-email" class="swal2-input" placeholder="Seu e-mail" style="width: 80%; margin: 10px auto; padding: 10px;">
      `,
      confirmButtonText: 'Enviar link',
      focusConfirm: false,
      backdrop: 'rgba(0,0,0,0.4)',
      heightAuto: false,
      customClass: {
        container: 'no-scroll'
      },
      didOpen: () => {
        document.body.style.overflow = 'hidden';
      },
      willClose: () => {
        document.body.style.overflow = 'auto';
      },
      preConfirm: () => {
        const email = (document.getElementById('reset-email') as HTMLInputElement).value;
        if (!email) {
          Swal.showValidationMessage('Por favor, digite seu e-mail');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Swal.showValidationMessage('Digite um e-mail válido');
          return false;
        }
        return email;
      }
    }).then((result) => {
      document.body.style.overflow = 'auto';
      if (result.isConfirmed && result.value) {
        this.authService.resetPassword(result.value).subscribe({
          next: () => {
            Swal.fire(
              'E-mail enviado!',
              'Verifique sua caixa de entrada para redefinir sua senha.',
              'success'
            );
          },
          error: (error) => {
            const message = error.code === 'auth/user-not-found' 
              ? 'E-mail não cadastrado' 
              : 'Erro ao enviar e-mail';
            Swal.fire('Erro', message, 'error');
          }
        });
      }
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
