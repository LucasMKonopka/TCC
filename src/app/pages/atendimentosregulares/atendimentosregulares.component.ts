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

  constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private atendimentosService: AtendimentosService,
      private toastr: ToastrService,
      private afAuth: AngularFireAuth,
      private pacientesService: PacientesService,
    ) {
      
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

}
