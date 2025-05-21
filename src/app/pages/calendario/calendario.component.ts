import { Component, OnInit } from '@angular/core';
import { CalendarioService } from "../../services/calendario.service";
import { PacientesService } from '../../services/pacientes.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

interface Consulta {
  id: string;
  data: string;
  horario: string;
  paciente: string;    
  pacienteId: string;  
}

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent implements OnInit {
  dataSelecionada: Date = new Date();  
  ultimaDataValida: Date = new Date();
  consultas: { id: string; data: string; horario: string; paciente: string, pacienteId: string }[] = [];  
  consultasDoDia: { id: string; horario: string; paciente: string }[] = []; 

  novoHorario: string = '';
  novoPaciente: string = '';

  isEditando: boolean = false;
  consultaEditandoIndex: number | null = null;

  pacientes: any[] = [];
  pacientesFiltrados: any[] = [];

  pacienteId: string;

  constructor(private calendarioService: CalendarioService, private afAuth: AngularFireAuth, private pacientesService: PacientesService, private toastr: ToastrService) {}

  ngOnInit() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    this.dataSelecionada = hoje;
    this.ultimaDataValida = new Date(hoje);

    this.carregarConsultas();
    this.carregarPacientes(); 
  }

  carregarPacientes() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.pacientesService.getAllPacientes(user.uid).subscribe(pacientes => {
          this.pacientes = pacientes;
          this.pacientesFiltrados = pacientes; 
        });
      }
    });
  }
  filtrarPacientes(event: Event) {
    const input = event.target as HTMLInputElement | null;
  
    if (!input) {
      return;
    }
  
    const valor = input.value;
  
    if (!valor) {
      this.pacientesFiltrados = this.pacientes;
      return;
    }
  
    const valorLower = valor.toLowerCase();
    this.pacientesFiltrados = this.pacientes.filter(paciente =>
      paciente.nome.toLowerCase().includes(valorLower)
    );
  }
  selecionarPaciente(nomePaciente: string) {
    this.novoPaciente = nomePaciente;
  }

  selecionarDia(novaData: Date) {
    const dataSelecionada = new Date(novaData);
    dataSelecionada.setHours(0, 0, 0, 0);
    
    this.dataSelecionada = dataSelecionada;
    this.ultimaDataValida = new Date(dataSelecionada);
    this.atualizarConsultasDoDia();
  }
  ehDiaPassado(): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
  
    const dataSelecionadaSemHora = new Date(this.dataSelecionada);
    dataSelecionadaSemHora.setHours(0, 0, 0, 0);
  
    return dataSelecionadaSemHora < hoje;
  }

  atualizarConsultasDoDia() {
    const dataFormatada = this.formatarData(this.dataSelecionada);
    this.consultasDoDia = this.consultas
      .filter(c => {
        const consultaData = new Date(c.data);
        const selectedData = new Date(dataFormatada);
        
        return consultaData.getFullYear() === selectedData.getFullYear() &&
               consultaData.getMonth() === selectedData.getMonth() &&
               consultaData.getDate() === selectedData.getDate();
      })
      .sort((a, b) => a.horario.localeCompare(b.horario));
  }
//////////////////////////////
converterHorarioParaMinutos(horario: string): number {
  const [horas, minutos] = horario.split(':').map(Number);
  return horas * 60 + minutos;
}
//////////

  agendarConsulta() {
    if (!this.novoHorario.trim() || !this.novoPaciente.trim()) {
      this.toastr.warning('Por favor, preencha todos os campos!'); 
      return;
    }
  
    if (/\d/.test(this.novoPaciente)) { 
      this.toastr.warning('O nome do paciente não pode conter números!'); 
      return;
    }

    const pacienteSelecionado = this.pacientes.find(p => 
      p.nome.toLowerCase() === this.novoPaciente.toLowerCase()
    );

    if (!pacienteSelecionado) {
      this.toastr.error('Paciente não encontrado. Selecione um paciente cadastrado.');
      return;
    }
  
    const novaConsulta = {
      data: this.formatarData(this.dataSelecionada),
      horario: this.novoHorario,
      paciente: this.novoPaciente,
      pacienteId: pacienteSelecionado.id 
    };
  
    if (this.isEditando && this.consultaEditandoIndex !== null) {
      const consulta = this.consultasDoDia[this.consultaEditandoIndex];
  
      const horarioExistenteEdicao = this.consultasDoDia.find(c => 
        c.horario === this.novoHorario && c.id !== consulta.id
      );
      if (horarioExistenteEdicao) {
        this.toastr.warning('Já existe uma consulta agendada para este horário!'); 
        return;
      }

      this.calendarioService.atualizarConsulta(
        consulta.id, 
        novaConsulta.horario, 
        novaConsulta.paciente, 
        novaConsulta.data,
        novaConsulta.pacienteId 
      )
        .then(() => {
          const consultaAtualizada = {
            id: consulta.id,
            data: novaConsulta.data,
            horario: novaConsulta.horario,
            paciente: novaConsulta.paciente,
            pacienteId: novaConsulta.pacienteId 
          };
  
          this.consultas = this.consultas.map(c =>
            c.id === consulta.id ? consultaAtualizada : c
          );
  
          this.atualizarConsultasDoDia();
          this.limparCampos();
          this.toastr.success('Consulta atualizada com sucesso!');
        })
        .catch(error => {
          this.toastr.error('Erro ao atualizar a consulta: ' + error.message); 
        });
    } else {
      const horarioExistente = this.consultasDoDia.find(c => c.horario === this.novoHorario);
      if (horarioExistente) {
        this.toastr.warning('Já existe uma consulta agendada para este horário!'); 
        return;
      }
      
      const novoHorarioEmMinutos = this.converterHorarioParaMinutos(this.novoHorario);

      const temIntervaloInvalido = this.consultasDoDia.some(c => {
        const horarioExistenteEmMinutos = this.converterHorarioParaMinutos(c.horario);
        return Math.abs(horarioExistenteEmMinutos - novoHorarioEmMinutos) < 20;
      });

      if (temIntervaloInvalido) {
        this.toastr.warning('Deve haver um intervalo mínimo de 20 minutos entre as consultas!');
        return;
      }

      this.calendarioService.salvarConsulta(
        novaConsulta.horario, 
        novaConsulta.paciente, 
        novaConsulta.data,
        novaConsulta.pacienteId 
      )
        .then((docRef) => {
          this.consultas.push({
            id: docRef.id,
            data: novaConsulta.data,
            horario: novaConsulta.horario,
            paciente: novaConsulta.paciente,
            pacienteId: novaConsulta.pacienteId 
          });
          this.atualizarConsultasDoDia();
          this.limparCampos();
          this.toastr.success('Consulta agendada com sucesso!');
        })
        .catch((error) => {
          this.toastr.error('Erro ao agendar a consulta: ' + error.message);
        });
    }
}

  limparCampos() {
    this.novoHorario = '';
    this.novoPaciente = '';
    this.isEditando = false;
    this.consultaEditandoIndex = null;
  }

  editarConsulta(index: number) {
    const consulta = this.consultasDoDia[index];
  
    if (!consulta.id) {
      this.toastr.error('Erro: Consulta sem ID. Não é possível editar.'); 
      return;
    }
  
    this.novoHorario = consulta.horario;
    this.novoPaciente = consulta.paciente;
  
    this.isEditando = true;
    this.consultaEditandoIndex = index; 
  }

  excluirConsulta(index: number) {
    const consulta = this.consultasDoDia[index];
  
    if (!consulta.id) {
      Swal.fire('Erro', 'Consulta sem ID. Não é possível excluir.', 'error');
      return;
    }

    Swal.fire({
      title: 'Você tem certeza?',
      text: "Esta consulta será excluída permanentemente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.calendarioService.excluirConsulta(consulta.id)
          .then(() => {
            this.consultas = this.consultas.filter(c => c.id !== consulta.id);
            this.atualizarConsultasDoDia();
            Swal.fire('Excluído!', 'A consulta foi excluída com sucesso.', 'success');
          })
          .catch(error => {
            Swal.fire('Erro', 'Erro ao excluir a consulta: ' + error.message, 'error');
          });
      }
    });
  }

  formatarData(data: Date): string {
    const year = data.getFullYear();
    const month = (data.getMonth() + 1).toString().padStart(2, '0');
    const day = data.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  bloquearNumeros(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode >= 48 && charCode <= 57) { // Bloqueia números (0-9)
      event.preventDefault();
    }
  }

  carregarConsultas() {
    this.calendarioService.carregarConsultas()
      .then(consultas => {
        this.consultas = consultas;
        const dataAtual = new Date(this.dataSelecionada);
        this.selecionarDia(dataAtual);
      })
      .catch((error) => {
        this.toastr.error('Erro ao carregar consultas: ' + error.message);
      });
  }
}