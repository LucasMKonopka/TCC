import { Component } from '@angular/core';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent {
  dataSelecionada: Date = new Date();  // Começa com a data de hoje
  consultas: { data: string, horario: string, paciente: string }[] = [];
  consultasDoDia: { horario: string, paciente: string }[] = [];

  novoHorario: string = '';
  novoPaciente: string = '';

  constructor() {
    this.atualizarConsultasDoDia();
  }

  selecionarDia(novaData: Date) {
    this.dataSelecionada = novaData;
    this.atualizarConsultasDoDia();
  }

  atualizarConsultasDoDia() {
    const dataFormatada = this.formatarData(this.dataSelecionada);
    this.consultasDoDia = this.consultas.filter(c => c.data === dataFormatada);
  }

  agendarConsulta() {
    if (!this.novoHorario || !this.novoPaciente) {
      alert('Por favor, preencha todos os campos!');
      return;
    }

    const novaConsulta = {
      data: this.formatarData(this.dataSelecionada),
      horario: this.novoHorario,
      paciente: this.novoPaciente
    };

    this.consultas.push(novaConsulta);
    this.atualizarConsultasDoDia();

    // Limpa os campos após agendamento
    this.novoHorario = '';
    this.novoPaciente = '';
  }

  editarConsulta(index: number) {
    const consulta = this.consultasDoDia[index];
    this.novoHorario = consulta.horario;
    this.novoPaciente = consulta.paciente;

    // Remover do array de consultas para reescrevê-la
    this.excluirConsulta(index);
  }

  excluirConsulta(index: number) {
    this.consultas = this.consultas.filter((_, i) => i !== index);
    this.atualizarConsultasDoDia();
  }

  formatarData(data: Date): string {
    return data.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
}
