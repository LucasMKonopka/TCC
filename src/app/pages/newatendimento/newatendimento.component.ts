import { Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AtendimentosService } from '../../services/atendimentos.service';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PacientesService } from '../../services/pacientes.service';

import { MatDialog } from '@angular/material/dialog';
import { ModalNovoCardapioComponent } from '../../components/cardapios/modal-novo-cardapio/modal-novo-cardapio.component';
import { PdfService } from '../../services/pdf.service';
import { CardapioService, Cardapio } from '../../services/cardapio.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  tituloConsulta: string = '';
  fatores = [
    { descricao: 'Sedentário (pouco ou nenhum exercício)', valor: 1.2 },
    { descricao: 'Levemente ativo (exercício leve 1-3 dias/semana)', valor: 1.375 },
    { descricao: 'Moderadamente ativo (exercício moderado 3-5 dias/semana)', valor: 1.55 },
    { descricao: 'Altamente ativo (exercício pesado 6-7 dias/semana)', valor: 1.725 },
    { descricao: 'Extremamente ativo (treino pesado + trabalho físico)', valor: 1.9 }
  ];
  cardapioAtual: any = null;
  modoVisualizacao = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private atendimentosService: AtendimentosService,
    private toastr: ToastrService,
    private afAuth: AngularFireAuth,
    private pacientesService: PacientesService,
    public dialog: MatDialog,
    private pdfService: PdfService,
    private cardapioService: CardapioService,
    private sanitizer: DomSanitizer
  ) {
    this.consultaForm = this.createForm();
  }

  ngOnInit(): void {
  // Primeiro verifica o modo de visualização pelos queryParams
  this.route.queryParams.subscribe(params => {
    this.modoVisualizacao = params['modo'] === 'visualizar';
    
    // Se for modo visualização, desabilita o formulário
    if (this.modoVisualizacao) {
      this.consultaForm.disable();
      this.tituloConsulta = 'Visualizando Consulta';
    }
  });

  // Mantém toda a lógica existente de params
  this.route.paramMap.subscribe(params => {
    this.pacienteId = params.get('pacienteId') || '';

    const state = window.history.state;
    this.pacienteNome = state?.pacienteNome || '';
    this.atendimentoId = state?.atendimentoId || null;
    this.isEdicao = !!state?.modoEdicao;

    if (!this.pacienteId) return;

    this.pacientesService.getPacienteById(this.pacienteId).subscribe({
      next: (dados) => {
        this.paciente = dados;
        this.exibirGestante = dados.sexo?.toLowerCase() === 'feminino';
        
        if (this.modoVisualizacao && !this.atendimentoId) {
          this.atendimentoId = params.get('id'); 
        }
      },
      error: (err) => {
        console.error('Erro ao buscar paciente:', err);
      }
    });

    if ((this.isEdicao || this.modoVisualizacao) && this.pacienteId) {
      this.carregarDadosAtendimento();

      if (this.atendimentoId) {
        this.cardapioService.obterCardapio(this.pacienteId, this.atendimentoId)
          .subscribe(cardapio => {
            if (cardapio) {
              this.cardapioAtual = cardapio;
            }
          });
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
    this.tipoPaciente = dados.tipoPaciente || '';
    this.isGestante = dados.isGestante || false;
    this.tituloConsulta = dados.titulo || '';

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
      mudancasHabitoAlimentar: [''],
      mudancasFinaisSemana: [''],
      ingestaoLiquidos: [''],
      ingestaoAgua: [''],
      horarioFome: [[]],
      preferenciaSabor: [''],
      alimentosLightDiet: [''],
      frequenciaRestaurantes: [''],
      consumoDoces: [''],
      consumoFrituras: [''],
      usoSuplementos: this.fb.group({
        usa: [false],
        quais: [''],
        indicacao: ['']
      }),
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
      lazer: [''],
      atividadeFisica: this.fb.group({
        pratica: [false],
        frequencia: [''],
        intensidade: [''],
        duracao: [''],
      }),
      observacoesadicionais: [''],//
      restricoesReligiosas: [''],
      cirurgias: [''],
      historicoDieteticoFamiliar: [''],
      historicoDieteticoPaciente: [''],
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
      sistemaReprodutorFeminino: this.fb.group({
        menstruacaoRegular: [false],
        tpm: [false],
        observacaoTpm: [''], 
        amenorreia: [false],
        menopausa: [false],
        idadeInicioMenopausa: [''],
        partos: ['']
      }),
            
      alergias: this.fb.group({
        usa: [false],
        quaisAlergias: ['']
      }),
      
      doencasCronicas: this.fb.group({
        usa: [false],
        quaisDoencas: ['']
      }),
  
      medicamentos: this.fb.group({
        usa: [false],
        quaisMedicamentos: [''],
        frequencia: [''],
        horarios: ['']
      }),
      
      //sobrando
      jaConsultouNutricionista: [''],
      acordaNoite: [''],
      consumoLightDiet: [false],
      historicoDietas: this.fb.group({
        fez: [false],
        orientacao: [''],
        resultados: ['']
      }),
      //
      
      
      
      //infantil
      pacienteInfantil: this.fb.group({
        pediatra: [''],
        tipoParto: [''],
        semanasGestacionais: [''],
        pesoNascimento: [''],
        comprimentoNascimento: [''],
        amamentado: [''],
        tempoAmamentacao: [''],
        usoFormula: [''],
        idadeIntroducaoAlimentar: [''],
        alimentosIntroducao: [''],
        rotinaEstudos: [''],
        mastigacao: [''],
        alimentoFavorito: [''],
        refeicoesEscola: [''],
      }),

      //adolescente
      pacienteAdolescente: this.fb.group({
        vacinacao: [''],
        refeicaoEscola: [''],
        comeAssistindoTV: [''],
        pressaoEstetica: [''],
        pulaRefeicoes: [''],
        compulsaoAlimentar: [''],
        segueInfluenciadores: [''],
        redesAfetamAlimentacao: [''],
        rotinaEstudos: [''],
        alteracoesHumorAlimentacao: ['']
      }),

      //idoso
      pacienteIdoso: this.fb.group({
        confusaoMental: [''],
        fraquezaFadiga: [''],
        apetiteDiminuido: [''],
        sarcopenia: [''],
        quedasRecentes: [''],
        mobilidade: [''],
        proteseDentaria: ['']
      }),
      
      //gestante
      gestanteInfo: this.fb.group({
        situacaoMatrimonial: [''],
        primeiraGestacao: [''],
        semanasGestacionais: [''],
        abortoAnterior: [''],
        fazAcompanhamento: [false],
        preNatalFrequencia: [''],
        
        sintomasGestacao: this.fb.group({
          alteracaoApetite: [false],
          enjoos: [false],
          temDesejos: [false],
          descricao: [''],
          frequencia: [''],
          tipo: ['desejo'],
          consome: [false],
          detalhesConsumo: [''],
          historico: ['']
        }),
      })  
    });
  }

  get pacienteInfantilForm(): FormGroup {
    return this.consultaForm.get('pacienteInfantil') as FormGroup;
  }
  get pacienteAdolescenteForm(): FormGroup {
    return this.consultaForm.get('pacienteAdolescente') as FormGroup;
  }
  get pacienteAdultoForm(): FormGroup {
    return this.consultaForm.get('pacienteAdulto') as FormGroup;
  }
  get pacienteIdosoForm(): FormGroup {
    return this.consultaForm.get('pacienteIdoso') as FormGroup;
  }
  get sistemaReprodutorFemininoForm(): FormGroup {
    return this.consultaForm.get('sistemaReprodutorFeminino') as FormGroup;
  }
  get gestanteInfoForm(): FormGroup {
    return this.consultaForm.get('gestanteInfo') as FormGroup;
  }

  async onSubmit() {
    if (!this.tipoPaciente) {
      this.toastr.warning('Selecione o tipo de paciente');
      return;
    }

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
      titulo: this.tituloConsulta, 
      isGestante: this.isGestante,
      tipoPaciente: this.tipoPaciente,
      nutricionistaId: user?.uid || '',
      data: new Date().toISOString(),
      tipo: 'primeira'
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

  

  novoCardapio() {
      const dialogRef = this.dialog.open(ModalNovoCardapioComponent, {
      width: '700px',
      height: '85vh',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'cardapio-modal-centralizado',
      data: {
      cardapio: this.cardapioAtual,
      modoVisualizacao: this.modoVisualizacao
      }
      });
  
  
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result && !this.modoVisualizacao) {
          this.cardapioAtual = result;
          this.consultaForm.patchValue({
            cardapio: result
          });
  
          this.toastr.success('Cardápio salvo na consulta!');
  
          if (this.pacienteId && this.atendimentoId) {
            try {
              await this.cardapioService.salvarCardapio(this.pacienteId, this.atendimentoId, result);
              this.toastr.success('Cardápio salvo com sucesso no Firebase!');
            } catch (error) {
              console.error('Erro ao salvar cardápio no Firebase:', error);
              this.toastr.error('Erro ao salvar cardápio no Firebase');
            }
          }
      }
    });
  }


    gerarPdf(): void {
      if (this.cardapioAtual) {
        this.pdfService.gerarPdfCardapio(this.cardapioAtual);
      } else {
        this.toastr.warning('Nenhum cardápio para exportar');
      }
    }

  cancelar() {
    this.router.navigate(['/listatendimentos', this.pacienteId]);
  }

}
