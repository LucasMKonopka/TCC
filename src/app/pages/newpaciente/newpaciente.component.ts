import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PacientesService } from '../../services/pacientes.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-newpaciente',
  templateUrl: './newpaciente.component.html',
  styleUrls: ['./newpaciente.component.scss']
})
export class NewpacienteComponent implements OnInit {
  form!: FormGroup;  // Adicione a exclamação (!) para indicar que será inicializado depois

  constructor(
    private fb: FormBuilder,
    private pacientesService: PacientesService,
    private router: Router,
    private snackBar: MatSnackBar
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
      try {
        await this.pacientesService.addPaciente(this.form.value);
        this.snackBar.open('Paciente cadastrado com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/pacientes']);
      } catch (erro) {
        this.snackBar.open('Erro ao cadastrar paciente', 'Fechar', { duration: 3000 });
        console.error(erro);
      }
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
    this.router.navigate(['/pacientes']);
  }
}