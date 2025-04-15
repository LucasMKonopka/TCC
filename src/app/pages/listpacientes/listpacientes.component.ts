import { Component, OnInit } from '@angular/core';
import { PacientesService } from '../../services/pacientes.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listpacientes',
  templateUrl: './listpacientes.component.html',
  styleUrl: './listpacientes.component.scss'
})
export class ListpacientesComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'cpf', 'acoes'];
  dataSource = new MatTableDataSource<any>();
  loading = true;
  userName: string = '';

  constructor(
    private pacientesService: PacientesService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  async ngOnInit() {
    this.authService.getCurrentUser ().subscribe(user => {
      if (user) {
        this.userName = user.nome;
        console.log('Usuário autenticado:', user);
        this.carregarPacientes();
      } 
    });
    
  }

  async carregarPacientes() {
    console.log("[DEBUG] Iniciando carregamento...");
  
    const user = await firstValueFrom(this.authService.getCurrentUser());
    
    if (user?.uid) {
      console.log("[DEBUG] Usuário autenticado:", user.uid);
      
      this.pacientesService.getAllPacientes(user.uid).subscribe({
        next: (pacientes) => {
          console.log("[DEBUG] Pacientes recebidos:", pacientes);
          this.dataSource.data = pacientes;
          this.loading = false;
        },
        error: (err) => {
          console.error("[DEBUG] Erro na busca:", err);
          this.toastr.error('Erro ao carregar pacientes');
          this.loading = false;
        }
      });
    } else {
      console.error("[DEBUG] Nenhum usuário autenticado.");
      this.toastr.error('Erro na autenticação');
      this.loading = false;
    }
  }

  async excluirPaciente(pacienteId: string) {
    Swal.fire({
      title: 'Você tem certeza?',
      text: 'Essa ação não poderá ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.pacientesService.deletePaciente(pacienteId);
          this.toastr.success('Paciente excluído com sucesso!');
          this.carregarPacientes(); // Atualiza a lista
        } catch (error) {
          this.toastr.error('Erro ao excluir paciente');
        }
      }
    });
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  verAtendimentos(pacienteId: string) {
    this.router.navigate(['/listatendimentos', pacienteId]);
  }

  editarPaciente(pacienteId: string) {
    this.router.navigate(['/editar-paciente', pacienteId]);
  }

}
