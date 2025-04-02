import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent implements OnInit{

  nomeEdit: string = '';
  emailEdit: string = '';
  cpfEdit: string = '';
  senhaEdit: string = '';
  foto: string | null = null;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}

  ngOnInit() {
    this.authService.getCurrentUser ().subscribe(user => {
      if (user) {
        this.nomeEdit = user.nome;
        this.cpfEdit = user.cpf;
        this.emailEdit = user.email;
      } else {
        console.log('Usuário não autenticado');
        this.router.navigate(['/Login']);
      }
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.foto = e.target?.result as string; // Armazena a imagem selecionada
      };
      reader.readAsDataURL(file);
    }
  }

  salvarEdit() {
    if (this.isFormInvalid()) {
      this.toastr.warning('Por favor, preencha todos os campos corretamente.', 'Atenção');
      return;
    }
  
    Swal.fire({
      title: 'Confirmação de Senha',
      input: 'password',
      inputLabel: 'Digite sua senha atual para confirmar as alterações',
      inputPlaceholder: 'Senha atual',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      preConfirm: (senhaAtual) => {
        return this.authService.updateEmail(this.emailEdit, senhaAtual)
          .then(() => {
            const updatedData = {
              nome: this.nomeEdit,
              cpf: this.cpfEdit,
              email: this.emailEdit,
            };
  
            return this.authService.updateUser(updatedData).toPromise()
              .then(() => {
                Swal.fire(
                  'E-mail de verificação enviado!',
                  'Verifique sua caixa de entrada e confirme o novo e-mail antes da alteração.',
                  'info'
                );
              })
              .catch(error => {
                Swal.showValidationMessage(`Erro ao atualizar os dados: ${error}`);
                return false;
              });
          })
          .catch(error => {
            Swal.showValidationMessage(`Erro: ${error}`);
            return false;
          });
      }
    });
  }

  isFormInvalid(): boolean {
    return (
      Boolean(!this.nomeEdit || this.nomeEdit.length < 3) ||
      Boolean(!this.cpfEdit || this.cpfEdit.length !== 11) ||
      Boolean(!this.emailEdit || !this.isValidEmail(this.emailEdit)) ||
      Boolean(this.senhaEdit && this.senhaEdit.length < 6)
    );
  }
  
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
