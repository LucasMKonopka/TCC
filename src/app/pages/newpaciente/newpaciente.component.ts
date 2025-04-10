import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PacientesService } from '../../services/pacientes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-newpaciente',
  templateUrl: './newpaciente.component.html',
  styleUrls: ['./newpaciente.component.scss']
})
export class NewpacienteComponent implements OnInit {
  form!: FormGroup;
  loading = false; 
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private pacientesService: PacientesService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      sexo: ['', Validators.required],
      cpf: ['', [
        Validators.required,
        Validators.pattern(/^\d{11}$/),
      ]],
      telefone: ['', Validators.required],
      cep: ['', Validators.required],
      rua: ['', Validators.required],
      numero: ['', Validators.required],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      alergias: [''],
      doencasCronicas: [''],
      medicamentosContinuos: [''],
      historicoDiabetes: [false],
      historicoHipertensao: [false],
      historicoOutros: ['']
    });
  }

  checkEditMode(): void {
    const pacienteId = this.route.snapshot.paramMap.get('id'); // Obter o ID do paciente da rota
    if (pacienteId) {
      this.isEdit = true; // Mudar para modo de edição
      this.carregarPaciente(pacienteId); // Carregar os dados do paciente
    }
  }
  async carregarPaciente(pacienteId: string): Promise<void> {
    this.pacientesService.getPacienteById(pacienteId).subscribe(paciente => {
      if (paciente) {
        this.form.patchValue(paciente); // Preencher o formulário com os dados do paciente
      } else {
        this.toastr.error('Paciente não encontrado', 'Erro');
        this.router.navigate(['/home']); // Redirecionar se o paciente não for encontrado
      }
    });
  }

  async salvar(): Promise<void> {
    if (this.form.valid) {
      this.loading = true;
      try {
        if (this.isEdit) {
          await this.pacientesService.update(this.route.snapshot.paramMap.get('id')!, this.form.value);
          this.toastr.success('Paciente atualizado com sucesso!', 'Sucesso');
        } else {
          const cpfExistente = await this.pacientesService.verificarCpfExistente(this.form.value.cpf);
          if (cpfExistente) {
            this.toastr.error('Este CPF já está cadastrado no sistema', 'Erro');
            this.form.get('cpf')?.setErrors({ cpfExistente: true });
            return;
          }
          await this.pacientesService.addPaciente(this.form.value);
          this.toastr.success('Paciente cadastrado com sucesso!', 'Sucesso');
        }
        this.form.reset(); 
        this.initForm();
        this.router.navigate(['/home']); 
      } catch (erro: unknown) {
        // Lidar com erros
      } finally {
        this.loading = false;
      }
    } else {
      this.toastr.warning('Por favor, preencha todos os campos obrigatórios', 'Atenção');
    }
  }

  
  


  buscarCEP(): void {
    const cep = this.form.get('cep')?.value.replace(/\D/g, '');
    if (cep?.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(dados => {
          if (!dados.erro) {
            this.form.patchValue({
              rua: dados.logradouro,
              bairro: dados.bairro,
              cidade: dados.localidade,
              estado: dados.uf
            });
          }
        });
    }
  }

  cancelar(): void {
    if (this.form.dirty) {
      if (confirm('Tem certeza que deseja cancelar? As alterações serão perdidas.')) {
        this.router.navigate(['/pacientes']);
      }
    } else {
      this.router.navigate(['/pacientes']);
    }
  }
}