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

import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'Login', component: LoginComponent},
  {path: 'home', component: HomeComponent, canActivate: [authGuard]},
  {path: 'signup', component: SignupComponent},
  {path: 'editUser', component: EditUserComponent, canActivate: [authGuard]},
  {path: 'calendario', component: CalendarioComponent, canActivate: [authGuard]},
  {path: 'newpacientes', component: NewpacienteComponent, canActivate: [authGuard]},
  {path: 'newpacientes/:id', component: NewpacienteComponent, canActivate: [authGuard]},
  {path: 'listpacientes', component: ListpacientesComponent, canActivate: [authGuard]},
  {path: 'editar-paciente/:id', component: NewpacienteComponent, canActivate: [authGuard]},
  {path: 'listatendimentos/:id', component: ListatendimentosComponent, canActivate: [authGuard]},
  {path: 'newatendimento/:pacienteId', component: NewatendimentoComponent, canActivate: [authGuard]},
  {path: 'atendimentosregulares/:id', component: AtendimentosregularesComponent, canActivate: [authGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
