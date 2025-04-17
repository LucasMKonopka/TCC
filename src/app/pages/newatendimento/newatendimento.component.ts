import { Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AtendimentosService } from '../../services/atendimentos.service';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PacientesService } from '../../services/pacientes.service';

@Component({
  selector: 'app-newatendimento',
  templateUrl: './newatendimento.component.html',
  styleUrl: './newatendimento.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewatendimentoComponent implements OnInit{
  consultaForm: FormGroup;
  pacienteId: string;
  loading = false;
  genero: string = '';
  pacienteNome: string = '';
  paciente: any = null;
  isEdicao = false;
  atendimentoId: string | null = null;
  atendimentoOriginal: any = null;
  isInfantil = false;
  isAdolescente = false;
  isAdulto = false;
  isIdoso = false;
  tipoPaciente: string = '';
  exibirGestante: boolean = false;
  isGestante: boolean = false;
  

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private atendimentosService: AtendimentosService,
    private toastr: ToastrService,
    private afAuth: AngularFireAuth,
    private pacientesService: PacientesService
  ) {
    this.consultaForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.pacienteId = params.get('pacienteId') || '';
      
      const state = window.history.state;
      if (state) {
        this.pacienteNome = state.pacienteNome || '';
        this.atendimentoId = state.atendimentoId || null;
        this.isEdicao = state.modoEdicao || false;
      }
  
      if (this.pacienteId) {
        this.pacientesService.getPacienteById(this.pacienteId).subscribe({
          next: (dados) => {
            this.paciente = dados;
            this.exibirGestante = dados.sexo?.toLowerCase() === 'feminino'; // <- adiciona essa lógica
          },
          error: (err) => {
            console.error('Erro ao buscar paciente:', err);
          }
        });
  
        if (this.isEdicao && this.atendimentoId) {
          this.carregarDadosAtendimento();
        }
      }
    });
  }

  private carregarDadosPaciente(): void {
    this.pacientesService.getPacienteById(this.pacienteId).subscribe({
      next: (dados) => {
        this.paciente = dados;
      },
      error: (err) => {
        console.error('Erro ao buscar paciente:', err);
      }
    });
  }

  private carregarDadosAtendimento(): void {
    if (!this.atendimentoId) return;
    
    this.atendimentosService.getAtendimentoById(this.atendimentoId)
      .then(atendimento => {
        this.preencherFormulario(atendimento);
      })
      .catch(error => {
        console.error('Erro ao carregar atendimento:', error);
        this.toastr.error('Erro ao carregar dados do atendimento');
      });
  }

  private preencherFormulario(atendimento: any): void {
    if (!this.consultaForm) {
      setTimeout(() => this.preencherFormulario(atendimento), 100);
      return;
    }

    const dados = { ...atendimento };
    delete dados.id;
    delete dados.pacienteId;
    delete dados.nutricionistaId;
    delete dados.data;
    delete dados.createdAt;
    delete dados.updatedAt;
    delete dados.tipo;

    this.consultaForm.patchValue(dados);
    
    this.consultaForm.markAsPristine();
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
  
  createForm(): FormGroup {
    return this.fb.group({
      // Seção 1: Dados Antropométricos
      pesoAtual: ['', [Validators.required, Validators.min(30)]],
      pesoHabitual: [''],
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
  
      // Seção 2: Padrão Alimentar
      refeicoesPorDia: [''],
      localAlimentacao: [''],
      horariosAlimentacao: [''],
      companhiaRefeicoes: [''],
      duracaoRefeicoes: [''],
      percepcaoSaciedade: [''],
      preparadorRefeicoes: [''],
      formaPreparoComum: [''],
      responsavelCompras: [''],
      frequenciaCompras: [''],
      apetiteAtual: [''],
      preferenciasAlimentares: [''],
      alimentosRejeitados: [''],
  
      // Seção 3: Comportamento Alimentar
      mudancasHabitoAlimentar: [''],
      mudancasFinaisSemana: [''],
      ingestaoLiquidos: [''],
      alimentosLightDiet: [''], 
    preferenciaSabor: [''],
      consumoLightDiet: [false],
      usoSuplementos: this.fb.group({
        usa: [false],
        quais: [''],
        indicacao: ['']
      }),
      historicoDietas: this.fb.group({
        fez: [false],
        orientacao: [''],
        resultados: ['']
      }),
  
      // Seção 4: Motivações e Estilo de Vida
      motivoConsulta: ['', Validators.required],
      profissao: [''],
      localTrabalho: [''],
      cargaHoraria: [''],
      meioLocomocao: [''],
      escolaridade: [''],
      estadoCivil: [''],
      composicaoDomicilio: [''],
      horasSono: [''],
      qualidadeSono: [''],
      atividadeFisica: this.fb.group({
        pratica: [false],
        frequencia: [''],
        intensidade: [''],
        duracao: ['']
      }),
      lazer: [''],
  
      // Seção 5: Aspectos Clínicos
      restricoesReligiosas: [''],
      alcool: this.fb.group({
        usa: [false],
        tempo: [''],
        frequencia: [''],
        tipo: [''],
        quantidade: ['']
      }),
      fumo: this.fb.group({
        fuma: [false],
        tempo: [''],
        frequencia: [''],
        tipo: [''],
        quantidade: ['']
      }),
      drogas: this.fb.group({
        usa: [false],
        tempo: [''],
        frequencia: [''],
        tipo: [''],
        quantidade: ['']
      }),
  
      // Seção 6: Avaliação por Sistemas
      sistemaNeurologico: this.fb.group({
        cognicao: [''],
        emocional: [''],
        autonomia: [''],
        comunicacao: ['']
      }),
      sistemaDigestorio: this.fb.group({
        dentição: [''],
        degluticao: [''],
        dorEngolir: [false],
        digestao: [''],
        evacuacao: this.fb.group({
          frequencia: [''],
          consistencia: ['']
        })
      }),
      sistemaUrinario: this.fb.group({
        frequencia: [''],
        coloracao: [''],
        sangue: [false],
        incontinencia: [false],
        edema: [false]
      }),
      sistemaReprodutor: this.fb.group({
        menstruacaoRegular: [false],
        tpm: [false],
        observacaoTpm: [''], 
        amenorreia: [false],
        menopausa: [false],
        idadeInicioMenopausa: [''],
        partos: ['']
      })
    });
  }

  async onSubmit() {
    if (this.consultaForm.invalid) {
      this.markFormGroupTouched(this.consultaForm);
      this.toastr.warning('Preencha todos os campos obrigatórios');
      return;
    }
  
    this.loading = true;
    try {
      const formData = await this.prepareFormData();
      
      if (this.isEdicao && this.atendimentoId) {
        await this.atendimentosService.atualizarAtendimento(this.atendimentoId, formData);
        this.toastr.success('Atendimento atualizado com sucesso!');
      } else {
        await this.atendimentosService.criarPrimeiraConsulta(this.pacienteId, formData);
        this.toastr.success('Primeira consulta registrada com sucesso!');
      }
      
      this.router.navigate(['/listatendimentos', this.pacienteId]);
    } catch (error) {
      const mensagem = this.isEdicao ? 'Erro ao atualizar consulta' : 'Erro ao registrar consulta';
      this.toastr.error(mensagem);
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  async prepareFormData(): Promise<any> {
    const formValue = this.consultaForm.value;
    const user = await this.afAuth.currentUser;
  
    return {
      ...formValue,
      nutricionistaId: user?.uid || '',
      data: new Date().toISOString(),
      tipo: 'primeira'
    };
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/listatendimentos', this.pacienteId]);
  }

}
