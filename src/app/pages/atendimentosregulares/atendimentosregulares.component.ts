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
  loading = false;
  exibirGestante: boolean = false;
  isGestante: boolean = false;
  atendimentoId: string | null = null;

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
        titulo: [''],
        pesoAtual: ['', [Validators.required, Validators.max(500)]],
        pesoHabitual: [''],
        alturaAtual: ['', [Validators.required]],
        fatorAtividadeFisica: [''],
        tmb: [{ value: '', disabled: true }],
        get: [{ value: '', disabled: true }],
        observacoesadicionais: [''],
        
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
    
        
          sentimentosDesdeUltimaConsulta: [''],
          seguiuPlano: [''],
          dificuldadesAlimentacao: [''],
          sintomasMelhoraram: [''],
          disposicaoEnergia: [''],
        
    
        
          compulsaoAlimentar: [''],
          momentosFome: [''],
          horariosRefeicao: [''],
          fomeSaciedade: [''],
        
    
        
          humor: [''],
          estresseAfetandoAlimentacao: [''],
          apoioFamiliar: [''],
        
    
        
          ajustesPlano: [''],
          alimentosIncluirExcluir: [''],
          necessidadeFlexibilidade: ['']
        
      });
    }


    ngOnInit(): void {
      const pacienteId = this.route.snapshot.paramMap.get('id');
      if (pacienteId) {
        this.carregarDados(pacienteId);
      }
      
      this.route.paramMap.subscribe(params => {
        this.idPaciente = params.get('id') || '';
        
        const state = window.history.state;
        if (state) {
          this.atendimentoId = state.atendimentoId || null;
          this.isEdicao = state.modoEdicao || false;
        }
  
        if (this.idPaciente) {
          this.carregarPaciente();
          
          if (this.isEdicao && this.idPaciente) {
            this.carregarDadosAtendimento();
          } else {
            this.carregarInformacoesIniciais();
          }
        }
      });
    }

    async carregarDados(pacienteId: string) {
      try {
        this.paciente = await firstValueFrom(this.pacientesService.getPacienteById(pacienteId));
        console.log('Paciente encontrado:', this.paciente); 
    
        const consultas = await this.atendimentosService.getConsultasPorPaciente(pacienteId);
        
        const primeiraConsulta = consultas.find((consulta: any) => consulta.tipo === 'primeira');
      if (primeiraConsulta) {
        this.informacoesIniciais = primeiraConsulta;
        console.log('Informações iniciais encontradas:', this.informacoesIniciais);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        this.toastr.error('Erro ao carregar dados', 'Erro');
      } finally {
        this.loading = false;
      }
    }
        
  
    private carregarPaciente(): void {
      this.pacientesService.getPacienteById(this.idPaciente).subscribe({
        next: (dados) => {
          this.paciente = dados;
        },
        error: (err) => {
          console.error('Erro ao buscar paciente:', err);
          this.toastr.error('Erro ao carregar dados do paciente');
        }
      });
    }
  
    private carregarInformacoesIniciais(): void {
      this.atendimentosService.getConsultasPorPaciente(this.idPaciente)
        .then(consultas => {
          const consultaRegular = consultas.find((consulta: any) => consulta.tipo === 'regular');
          if (consultaRegular) {
            this.informacoesIniciais = consultaRegular;
          }
        })
        .catch(error => {
          console.error('Erro ao carregar consultas:', error);
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
      this.tituloConsulta = dados.titulo || '';
  
      // Remove campos que não são parte do formulário
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

  async onSubmit() {
    if (this.consultaForm.invalid) {
      this.markFormGroupTouched(this.consultaForm);
      this.toastr.warning('Preencha todos os campos obrigatórios');
      return;
    }
  
    this.loading = true;
    try {
      const formData = await this.prepareFormData();
      
      if (this.isEdicao && this.atendimentoId) {  // Alterado para verificar atendimentoId
        await this.atendimentosService.atualizarAtendimento(this.atendimentoId, formData);  // Usando atendimentoId
        this.toastr.success('Atendimento atualizado com sucesso!');
      } else {
        await this.atendimentosService.criarConsultaRegular(this.idPaciente, formData);
        this.toastr.success('Consulta registrada com sucesso!');
      }
      
      this.router.navigate(['/listatendimentos', this.idPaciente]);
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
      titulo: this.tituloConsulta, 
      isGestante: this.isGestante,
      nutricionistaId: user?.uid || '',
      data: new Date().toISOString(),
      tipo: 'regular'
    };
  }

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

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/listatendimentos', this.idPaciente]);
  }

}
