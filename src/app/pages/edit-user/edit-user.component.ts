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
        // this.foto = user.fotoUrl; // Exemplo, ajuste conforme necessário
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
    // Verifica se o formulário é válido
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
        return this.authService.reauthenticate(senhaAtual).then(() => {
          return true;
        }).catch(error => {
          Swal.showValidationMessage(`Senha incorreta: ${error.message}`);
          return false;
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedData = {
          nome: this.nomeEdit,
          cpf: this.cpfEdit,
          email: this.emailEdit,
        };
  
        // Atualize os dados do usuário
        this.authService.updateUser(updatedData).subscribe(() => {
          // Se uma nova senha foi fornecida, atualize a senha
          if (this.senhaEdit) {
            this.authService.updatePassword(this.senhaEdit).then(() => {
              this.toastr.success('Dados e senha atualizados com sucesso!', 'Sucesso');
              this.router.navigate(['/home']);
            }).catch(error => {
              console.error('Erro ao atualizar a senha:', error);
              this.toastr.error('Erro ao atualizar a senha.', 'Erro');
            });
          } else {
            this.toastr.success('Dados atualizados com sucesso!', 'Sucesso');
            this.router.navigate(['/home']);
          }
        }, error => {
          console.error('Erro ao atualizar os dados:', error);
          this.toastr.error('Erro ao atualizar os dados.', 'Erro');
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
  
  // Método para validar o formato do email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
