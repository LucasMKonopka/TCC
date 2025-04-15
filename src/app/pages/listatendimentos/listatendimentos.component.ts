import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PacientesService } from '../../services/pacientes.service';
import { AtendimentosService } from '../../services/atendimentos.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { NewatendimentoComponent } from '../newatendimento/newatendimento.component';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-listatendimentos',
  templateUrl: './listatendimentos.component.html',
  styleUrl: './listatendimentos.component.scss'
})
export class ListatendimentosComponent implements OnInit{
  paciente: any = null;
  atendimentos = new MatTableDataSource<any>();
  displayedColumns: string[] = ['data', 'acoes'];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pacientesService: PacientesService,
    private atendimentosService: AtendimentosService,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  async ngOnInit() {
    const pacienteId = this.route.snapshot.paramMap.get('id');
    if (pacienteId) {
      await this.carregarDados(pacienteId);
    }
  }

  async carregarDados(pacienteId: string) {
    try {
        this.paciente = await firstValueFrom(this.pacientesService.getPacienteById(pacienteId));
        const atendimentos = await this.atendimentosService.getAtendimentosPorPaciente(pacienteId);
        this.atendimentos.data = atendimentos;
    } catch (error) {
        this.toastr.error('Erro ao carregar dados', 'Erro');
    } finally {
        this.loading = false;
    }
  }

  formatarCPF(cpf: string): string {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  novoAtendimento() {
    const dialogRef = this.dialog.open(NewatendimentoComponent, {
      width: '800px',
      data: { pacienteId: this.paciente.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carregarDados(this.paciente.id);
      }
    });
  }
  calcularIdade(dataNascimento: string): number {
    if (!dataNascimento) return 0;
    const nasc = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  }
  
  voltarParaLista() {
    this.router.navigate(['/listpacientes']);
  }

  
  editarAtendimento(atendimentoId: string) {
    // Implemente a edição (pode abrir o mesmo dialog de novo atendimento)
    console.log('Editar atendimento:', atendimentoId);
  }
  
  async excluirAtendimento(atendimentoId: string) {
    const confirm = await this.confirmarExclusao();
    if (confirm) {
      try {
        await this.atendimentosService.excluirAtendimento(atendimentoId);
        this.toastr.success('Atendimento excluído com sucesso!');
        this.carregarDados(this.paciente.id);
      } catch (error) {
        this.toastr.error('Erro ao excluir atendimento');
      }
    }
  }
  
  private confirmarExclusao(): Promise<boolean> {
    return Swal.fire({
      title: 'Confirmar exclusão?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar'
    }).then(result => result.isConfirmed);
  }
}
