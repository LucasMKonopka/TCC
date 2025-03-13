import { Component } from '@angular/core';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent {
  dataSelecionada: Date = new Date();  
  ultimaDataValida: Date = new Date();
  consultas: { data: string, horario: string, paciente: string }[] = [];
  consultasDoDia: { horario: string, paciente: string }[] = [];

  novoHorario: string = '';
  novoPaciente: string = '';

  constructor() {
    this.atualizarConsultasDoDia();
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

    this.consultas.push(novaConsulta);
    this.atualizarConsultasDoDia();

    this.novoHorario = '';
    this.novoPaciente = '';
  }

  editarConsulta(index: number) {
    const consulta = this.consultasDoDia[index];

    this.novoHorario = consulta.horario;
    this.novoPaciente = consulta.paciente;

    const dataFormatada = this.formatarData(this.dataSelecionada);
    this.consultas = this.consultas.filter(
      c => !(c.data === dataFormatada && c.horario === consulta.horario && c.paciente === consulta.paciente)
    );

    this.atualizarConsultasDoDia();
  }

  excluirConsulta(index: number) {
    const consulta = this.consultasDoDia[index];
    const dataFormatada = this.formatarData(this.dataSelecionada);

    this.consultas = this.consultas.filter(
      c => !(c.data === dataFormatada && c.horario === consulta.horario && c.paciente === consulta.paciente)
    );

    this.atualizarConsultasDoDia();
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
}
