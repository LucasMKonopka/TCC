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
  consultasDoDia: { horario: string; paciente: string }[] = []; 

  constructor(private authService: AuthService, private firestore: Firestore, private router: Router, private toastr: ToastrService) {}

  ngOnInit() {
    this.authService.getCurrentUser ().subscribe(user => {
      if (user) {
        this.userName = user.nome;
        console.log('Usuário autenticado:', user);
        
        if (user.metadata && user.metadata.creationTime) {
          this.dataCadastro = new Date(user.metadata.creationTime).toLocaleDateString('pt-BR'); 
          console.log('Data de cadastro obtida do Firebase Auth:', this.dataCadastro);
        } else {
          console.warn('Data de criação não encontrada no metadata do usuário.');
          this.dataCadastro = '';
        }
  
        this.loadPacientesAndConsultas(user.uid);
        this.loadConsultasDoDia(user.uid);
      } else {
        console.log('Usuário não autenticado');
        this.router.navigate(['/Login']);
      }
    });
  }
  
  private loadPacientesAndConsultas(nutricionistaId: string) {
    // Contar pacientes
    this.authService.countPacientes(nutricionistaId).subscribe(total => {
      this.totalPacientes = total;
      console.log('Total de pacientes:', this.totalPacientes);
    });
  
    // Contar consultas
    this.authService.countConsultas(nutricionistaId).subscribe(total => {
      this.totalConsultas = total;
      console.log('Total de consultas:', this.totalConsultas);
    });
  }

  private loadConsultasDoDia(nutricionistaId: string) {
    const dataAtual = new Date();
    const dataFormatada = this.formatarData(dataAtual); // Formata a data para YYYY-MM-DD
  
    this.authService.getConsultasDoDia(nutricionistaId, dataFormatada).subscribe(consultas => {
      this.consultasDoDia = consultas;
      console.log('Consultas do dia:', this.consultasDoDia);
    }, error => {
      console.error('Erro ao carregar consultas do dia:', error);
    });
  }

  private formatarData(data: Date): string {
    return data.toISOString().split('T')[0]; // Formato YYYY-MM-DD
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
      this.toastr.success('Conta excluída com sucesso!', 'Sucesso'); 
      this.router.navigate(['/Login']);
    }, error => {
      console.error('Erro ao excluir o usuário:', error);
    });
  }
}
