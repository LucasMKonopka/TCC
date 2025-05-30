import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { SignupComponent } from './pages/signup/signup.component';
import { EditUserComponent } from './pages/edit-user/edit-user.component';
import { CalendarioComponent } from './pages/calendario/calendario.component';
import { NewpacienteComponent } from './pages/newpaciente/newpaciente.component';
import { ListpacientesComponent } from './pages/listpacientes/listpacientes.component';
import { ListatendimentosComponent } from './pages/listatendimentos/listatendimentos.component';
import { NewatendimentoComponent } from './pages/newatendimento/newatendimento.component';
import { AtendimentosregularesComponent } from './pages/atendimentosregulares/atendimentosregulares.component';

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'Login', component: LoginComponent},
  {path: 'home', component: HomeComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'editUser', component: EditUserComponent},
  {path: 'calendario', component: CalendarioComponent},
  {path: 'newpacientes', component: NewpacienteComponent},
  {path: 'newpacientes/:id', component: NewpacienteComponent},
  {path: 'listpacientes', component: ListpacientesComponent},
  {path: 'editar-paciente/:id', component: NewpacienteComponent },
  {path: 'listatendimentos/:id', component: ListatendimentosComponent},
  {path: 'newatendimento/:pacienteId', component: NewatendimentoComponent},
  {path: 'atendimentosregulares/:id', component: AtendimentosregularesComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
