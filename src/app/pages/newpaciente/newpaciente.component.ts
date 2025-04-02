import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PacientesService } from '../../services/pacientes.service';
import { Router } from '@angular/router';
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

  constructor(
    private fb: FormBuilder,
    private pacientesService: PacientesService,
    private router: Router,
    private afAuth: AngularFireAuth,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      dataNascimento: ['', Validators.required],
      sexo: ['', Validators.required],
      cpf: ['', Validators.required],
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

  async salvar(): Promise<void> {
    if (this.form.valid) {
      this.loading = true;
      try {
        await this.pacientesService.addPaciente(this.form.value);
        this.toastr.success('Paciente cadastrado com sucesso!', 'Sucesso');
        this.form.reset(); 
        this.initForm();
        this.router.navigate(['/home']); 
      } catch (erro) {
        console.error('Erro completo:', erro);
        this.toastr.error('Erro ao cadastrar paciente', 'Erro');
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