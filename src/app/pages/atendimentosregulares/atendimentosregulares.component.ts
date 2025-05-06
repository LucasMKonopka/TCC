import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AtendimentosService } from '../../services/atendimentos.service';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PacientesService } from '../../services/pacientes.service';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-atendimentosregulares',
  templateUrl: './atendimentosregulares.component.html',
  styleUrl: './atendimentosregulares.component.scss'
})
export class AtendimentosregularesComponent implements OnInit{
  paciente: any = null;
  idPaciente!: string;
  consultaForm: FormGroup;
  informacoesIniciais: any = null;
  tituloConsulta: string = '';
  isEdicao = false;
  fatores = [
    { descricao: 'Sedentário (pouco ou nenhum exercício)', valor: 1.2 },
    { descricao: 'Levemente ativo (exercício leve 1-3 dias/semana)', valor: 1.375 },
    { descricao: 'Moderadamente ativo (exercício moderado 3-5 dias/semana)', valor: 1.55 },
    { descricao: 'Altamente ativo (exercício pesado 6-7 dias/semana)', valor: 1.725 },
    { descricao: 'Extremamente ativo (treino pesado + trabalho físico)', valor: 1.9 }
  ];

  constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private atendimentosService: AtendimentosService,
      private toastr: ToastrService,
      private afAuth: AngularFireAuth,
      private pacientesService: PacientesService,
    ) {
      this.consultaForm = this.createForm();
    }

    createForm(): FormGroup {
      return this.fb.group({
        titulo:[''],
        pesoAtual: ['', [Validators.required, Validators.max(500)]],
        pesoHabitual: [''],
        alturaAtual: ['', [Validators.required]],
        fatorAtividadeFisica: [''],
        tmb: [{ value: '', disabled: true }],
        get: [{ value: '', disabled: true }] ,
        perdaPeso: this.fb.group({
          teve: [false],
          tempo: [''],
          quantidade: [''],
          motivo: ['']
        }),
        ganhoPeso: this.fb.group({
          teve: [false],
          tempo: [''],
          quantidade: [''],
          motivo: ['']
        }),
      })
    }


    async ngOnInit(): Promise<void> {
      this.idPaciente = this.route.snapshot.paramMap.get('id')!;
    
      try {
        this.paciente = await firstValueFrom(this.pacientesService.getPacienteById(this.idPaciente));
        
        const consultas = await this.atendimentosService.getConsultasPorPaciente(this.idPaciente);
        const primeiraConsulta = consultas.find((consulta: any) => consulta.tipo === 'primeira');
    
        if (primeiraConsulta) {
          this.informacoesIniciais = primeiraConsulta;
        }
      } catch (error) {
        console.error('Erro ao carregar dados do paciente ou da primeira consulta', error);
        this.toastr.error('Erro ao carregar informações do paciente');
      }
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

  async onSubmit() {}

  calcularTMB_GET() {
    const peso = this.consultaForm.get('pesoAtual')?.value;
    const altura = this.consultaForm.get('alturaAtual')?.value;
    const fator = this.consultaForm.get('fatorAtividadeFisica')?.value;
    
    const sexo = this.paciente?.sexo;
    const idade = this.calcularIdade(this.paciente?.dataNascimento);
  
    if (!peso || !altura || !fator) {
      this.toastr.warning('Preencha o peso, altura e fator de atividade física.');
      return;
    }
  
    if (!sexo || idade == null) {
      this.toastr.warning('Sexo ou data de nascimento não disponíveis.');
      return;
    }
  
    let tmb = 0;
  
    if (sexo.toLowerCase() === 'masculino') {
      tmb = 66 + (13.8 * peso) + (5 * altura) - (6.8 * idade);
    } else if (sexo.toLowerCase() === 'feminino') {
      tmb = 655 + (9.6 * peso) + (1.8 * altura) - (4.7 * idade);
    } else {
      alert('Sexo não informado corretamente no cadastro do paciente.');
      return;
    }
  
    const get = tmb * fator;
  
    this.consultaForm.get('tmb')?.setValue(tmb.toFixed(2));
    this.consultaForm.get('get')?.setValue(get.toFixed(2));
  }

}
