import { Component, OnInit } from '@angular/core';
import { CalendarioService } from "../../services/calendario.service";
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent implements OnInit {
  dataSelecionada: Date = new Date();  
  ultimaDataValida: Date = new Date();
  consultas: { id: string; data: string; horario: string; paciente: string }[] = [];  
  consultasDoDia: { id: string; horario: string; paciente: string }[] = []; 

  novoHorario: string = '';
  novoPaciente: string = '';

  isEditando: boolean = false;
  consultaEditandoIndex: number | null = null; // Para armazenar o índice da consulta que está sendo editada

  constructor(private calendarioService: CalendarioService, private toastr: ToastrService) {}

  ngOnInit() {
    this.carregarConsultas();  
  }

  selecionarDia(novaData: Date) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (novaData < hoje) {
      this.toastr.warning('Não é possível marcar consultas em dias passados!'); // Usar toastr
      this.dataSelecionada = this.ultimaDataValida; 
      return;
    }

    this.dataSelecionada = novaData;
    this.ultimaDataValida = novaData;
    this.atualizarConsultasDoDia();
  }

  atualizarConsultasDoDia() {
    const dataFormatada = this.formatarData(this.dataSelecionada);
    this.consultasDoDia = this.consultas
      .filter(c => c.data === dataFormatada)
      .sort((a, b) => a.horario.localeCompare(b.horario));
  }

  agendarConsulta() {
    if (!this.novoHorario.trim() || !this.novoPaciente.trim()) {
      this.toastr.warning('Por favor, preencha todos os campos!'); // Usar toastr
      return;
    }
  
    if (/\d/.test(this.novoPaciente)) { 
      this.toastr.warning('O nome do paciente não pode conter números!'); // Usar toastr
      return;
    }
  
    const novaConsulta = {
      data: this.formatarData(this.dataSelecionada),
      horario: this.novoHorario,
      paciente: this.novoPaciente
    };
  
    if (this.isEditando && this.consultaEditandoIndex !== null) {
      // Atualiza a consulta existente
      const consulta = this.consultasDoDia[this.consultaEditandoIndex];
  
      // Verifica se o novo horário já está ocupado por outra consulta
      const horarioExistenteEdicao = this.consultasDoDia.find(c => c.horario === this.novoHorario && c.id !== consulta.id);
      if (horarioExistenteEdicao) {
        this.toastr.warning('Já existe uma consulta agendada para este horário!'); // Usar toastr
        return;
      }
  
      // Se não houver conflito, atualiza a consulta
      this.calendarioService.atualizarConsulta(consulta.id, novaConsulta.horario, novaConsulta.paciente, novaConsulta.data)
        .then(() => {
          // Atualiza a lista local
          const consultaAtualizada = {
            id: consulta.id,
            data: novaConsulta.data,
            horario: novaConsulta.horario,
            paciente: novaConsulta.paciente
          };
  
          // Atualiza a lista de consultas
          this.consultas = this.consultas.map(c =>
            c.id === consulta.id ? consultaAtualizada : c
          );
  
          // Atualiza a lista de consultas do dia
          this.atualizarConsultasDoDia();
  
          // Limpa os campos de edição
          this.limparCampos();
          this.toastr.success('Consulta atualizada com sucesso!'); // Usar toastr
        })
        .catch(error => {
          this.toastr.error('Erro ao atualizar a consulta: ' + error.message); // Usar toastr
        });
    } else {
      // Verifica se já existe uma consulta no mesmo horário
      const horarioExistente = this.consultasDoDia.find(c => c.horario === this.novoHorario);
      if (horarioExistente) {
        this.toastr.warning('Já existe uma consulta agendada para este horário!'); // Usar toastr
        return;
      }
  
      // Agendar nova consulta
      this.calendarioService.salvarConsulta(novaConsulta.horario, novaConsulta.paciente)
        .then((docRef) => {
          this.consultas.push({
            id: docRef.id,
            data: novaConsulta.data,
            horario: novaConsulta.horario,
            paciente: novaConsulta.paciente
          });
          this.atualizarConsultasDoDia();
  
          this.limparCampos();
          this.toastr.success('Consulta agendada com sucesso!'); // Usar toastr
        })
        .catch((error) => {
          this.toastr.error('Erro ao agendar a consulta: ' + error.message); // Usar toastr
        });
    }
  }
  
  // Método para limpar os campos e resetar o modo de edição
  limparCampos() {
    this.novoHorario = '';
    this.novoPaciente = '';
    this.isEditando = false;
    this.consultaEditandoIndex = null;
  }

  editarConsulta(index: number) {
    const consulta = this.consultasDoDia[index];
  
    if (!consulta.id) {
      this.toastr.error('Erro: Consulta sem ID. Não é possível editar.'); // Usar toastr
      return;
    }
  
    // Preenche os campos com os dados da consulta selecionada
    this.novoHorario = consulta.horario;
    this.novoPaciente = consulta.paciente;
  
    // Define o modo de edição
    this.isEditando = true;
    this.consultaEditandoIndex = index; // Armazena o índice da consulta que está sendo editada
  }

  excluirConsulta(index: number) {
    const consulta = this.consultasDoDia[index];
  
    if (!consulta.id) {
      Swal.fire('Erro', 'Consulta sem ID. Não é possível excluir.', 'error');
      return;
    }

    // Usando SweetAlert2 para confirmação
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
        // Exclui no Firestore
        this.calendarioService.excluirConsulta(consulta.id)
          .then(() => {
            // Remove a consulta da lista local
            this.consultas = this.consultas.filter(c => c.id !== consulta.id);
            // Atualiza a lista de consultas do dia
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
    return data.toISOString().split('T')[0]; // Formato YYYY-MM-DD
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
        this.atualizarConsultasDoDia();
      })
      .catch((error) => {
        this.toastr.error('Erro ao carregar consultas: ' + error.message); // Usar toastr
      });
  }
}