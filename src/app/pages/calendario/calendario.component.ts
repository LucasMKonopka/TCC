import { Component, OnInit } from '@angular/core';
import { CalendarioService } from "../../services/calendario.service";

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

  constructor(private calendarioService: CalendarioService) {}

  ngOnInit() {
    this.carregarConsultas();  
  }

  selecionarDia(novaData: Date) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (novaData < hoje) {
      alert('Não é possível marcar consultas em dias passados!');
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
      alert('Por favor, preencha todos os campos!');
      return;
    }
  
    if (/\d/.test(this.novoPaciente)) { 
      alert('O nome do paciente não pode conter números!');
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
        })
        .catch(error => {
          alert('Erro ao atualizar a consulta: ' + error.message);
        });
    } else {
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
        })
        .catch((error) => {
          alert('Erro ao agendar a consulta: ' + error.message);
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

  isEditando: boolean = false;
consultaEditandoIndex: number | null = null; // Para armazenar o índice da consulta que está sendo editada

editarConsulta(index: number) {
  const consulta = this.consultasDoDia[index];

  if (!consulta.id) {
    alert('Erro: Consulta sem ID. Não é possível editar.');
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
      alert('Erro: Consulta sem ID. Não é possível excluir.');
      return;
    }
  
    // Exclui no Firestore
    this.calendarioService.excluirConsulta(consulta.id)
      .then(() => {
        // Remove a consulta da lista local
        this.consultas = this.consultas.filter(c => c.id !== consulta.id);
  
        // Atualiza a lista de consultas do dia
        this.atualizarConsultasDoDia();
      })
      .catch(error => {
        alert('Erro ao excluir a consulta: ' + error.message);
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
        alert('Erro ao carregar consultas: ' + error.message);
      });
  }
}
