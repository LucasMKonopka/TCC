import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PacientesService } from '../../services/pacientes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-newpaciente',
  templateUrl: './newpaciente.component.html',
  styleUrls: ['./newpaciente.component.scss']
})
export class NewpacienteComponent implements OnInit {
  form!: FormGroup;
  loading = false; 
  isEdit = false;
  originalCpf: string | null = null;

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

    if (this.isEdit) {
      const pacienteId = this.route.snapshot.paramMap.get('id');
      this.pacientesService.getPacienteById(pacienteId!).subscribe(paciente => {
        this.form.patchValue(paciente);
        this.originalCpf = paciente.cpf;
      });
    }
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

    });
  }

  checkEditMode(): void {
    const pacienteId = this.route.snapshot.paramMap.get('id');
    if (pacienteId) {
      this.isEdit = true; 
      this.carregarPaciente(pacienteId);
    }
  }
  async carregarPaciente(pacienteId: string): Promise<void> {
    this.pacientesService.getPacienteById(pacienteId).subscribe(paciente => {
      if (paciente) {
        this.form.patchValue(paciente); 
      } else {
        this.toastr.error('Paciente não encontrado', 'Erro');
        this.router.navigate(['/home']); 
      }
    });
  }

  async salvar(): Promise<void> {
    if (this.form.valid) {
      this.loading = true;
      try {
        const cpfFormatado = this.form.value.cpf.replace(/\D/g, ''); 
  
        if (this.isEdit) {
          if (this.originalCpf !== cpfFormatado) {
            const cpfExistente = await this.pacientesService.verificarCpfExistente(cpfFormatado);
            if (cpfExistente) {
              this.toastr.error('Este CPF já está cadastrado no sistema', 'Erro');
              this.form.get('cpf')?.setErrors({ cpfExistente: true });
              return;
            }
          }
          await this.pacientesService.update(this.route.snapshot.paramMap.get('id')!, this.form.value);
          this.toastr.success('Paciente atualizado com sucesso!', 'Sucesso');
          this.router.navigate(['/listpacientes']); 
        } else {
          const cpfExistente = await this.pacientesService.verificarCpfExistente(cpfFormatado);
          if (cpfExistente) {
            this.toastr.error('Este CPF já está cadastrado no sistema', 'Erro');
            this.form.get('cpf')?.setErrors({ cpfExistente: true });
            return;
          }
          await this.pacientesService.addPaciente(this.form.value);
          this.toastr.success('Paciente cadastrado com sucesso!', 'Sucesso');
          this.router.navigate(['/home']); 
        }
        this.form.reset(); 
        this.initForm();
        
      } catch (erro: unknown) {
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
    if (this.isEdit){
      Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações serão perdidas!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, cancelar!',
        cancelButtonText: 'Não, continuar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/listpacientes']);
        }
      });
    }else{
      Swal.fire({
        title: 'Tem certeza?',
        text: 'As alterações serão perdidas!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, cancelar!',
        cancelButtonText: 'Não, continuar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/home']);
        }
      });
    } 
  }
}