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

    this.calendarioService.salvarConsulta(novaConsulta.horario, novaConsulta.paciente)
      .then(() => {
        this.consultas.push({
          id: '',
          data: novaConsulta.data,
          horario: novaConsulta.horario,
          paciente: novaConsulta.paciente
        });
        this.atualizarConsultasDoDia();

        this.novoHorario = '';
        this.novoPaciente = '';
      })
      .catch((error) => {
        alert('Erro ao agendar a consulta: ' + error.message);
      });
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
