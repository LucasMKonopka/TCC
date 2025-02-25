import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc } from 'firebase/firestore';
//alertas
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  userName: string = '';
  dataCadastro: string = '';
  totalConsultas: number = 0;
  totalPacientes: number = 0;

  constructor(private authService: AuthService, private firestore: Firestore, private router: Router, private toastr: ToastrService) {}

  ngOnInit() {
    this.authService.getCurrentUser ().subscribe(user => {
      if (user) {
        this.userName = user.nome;
        console.log('Usuário autenticado:', user);
  
        // Utiliza a data de criação da conta no Firebase Authentication
        if (user.metadata && user.metadata.creationTime) {
          this.dataCadastro = new Date(user.metadata.creationTime).toLocaleDateString('pt-BR'); // Formato brasileiro
          console.log('Data de cadastro obtida do Firebase Auth:', this.dataCadastro);
        } else {
          console.warn('Data de criação não encontrada no metadata do usuário.');
          this.dataCadastro = '';
        }
      } else {
        console.log('Usuário não autenticado');
        this.router.navigate(['/Login']);
      }
    });
  }

  confirmarExclusao() {
    Swal.fire({
      title: 'Você tem certeza?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUser();
      }
    });
  }

  deleteUser(){
    this.authService.deleteUser().subscribe(() => {
      this.toastr.success('Usuário excluído com sucesso!', 'Sucesso'); 
      this.router.navigate(['/Login']);
    }, error => {
      console.error('Erro ao excluir o usuário:', error);
    });
  }
}
